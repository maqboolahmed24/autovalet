import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { canTransitionBookingStatus } from "./lifecycle";
import { isPublicBookingReference } from "./references";
import { calendarBlockingStatuses } from "./statuses";
import type { BookingStatus, PackageId } from "./types";
import { transaction, isDatabaseConfigured } from "../db/postgres";
import { createAdminBookingUrl, createPublicBookingStatusUrl } from "../notifications/booking-summary";
import type { NotificationBookingSummary } from "../notifications/types";
import { dispatchBookingUpdateNotifications } from "../notifications/workflows";
import { formatMoneyGBP, getServicePackage } from "../pricing";

type RescheduleResponseAction = "accept" | "decline";

type RescheduleResponseResult =
  | {
      success: true;
      bookingReference: string;
      status: Extract<BookingStatus, "approved" | "pending_admin_review">;
      statusLabel: string;
      requestedStartLabel?: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

type RescheduleResponseRow = {
  id: string;
  reference: string;
  status: string;
  package_id: string;
  requested_start_at: Date | string;
  reschedule_proposed_start_at: Date | string | null;
  reschedule_message: string | null;
  service_duration_minutes: number;
  travel_buffer_minutes: number;
  estimated_total_minor: number;
  deposit_paid_minor: number;
  balance_due_minor: number;
  postcode: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_size: string | null;
};

type AcceptTransactionResult =
  | (Extract<RescheduleResponseResult, { success: true }> & {
      booking: RescheduleResponseRow;
      proposedStart: Date;
    })
  | Extract<RescheduleResponseResult, { success: false }>;

type RescheduleFailureResult = Extract<RescheduleResponseResult, { success: false }>;

function toIsoString(value: Date | string | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function toPackageId(value: string): PackageId {
  return value === "deep_clean" ? "deep_clean" : "maintenance";
}

function formatBusinessDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

function formatBusinessTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

function formatBusinessDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

function buildNotificationSummary(
  booking: RescheduleResponseRow,
  requestedStart: Date,
  statusLabel: string,
): NotificationBookingSummary {
  const vehicleLabel = [booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(" ").trim();

  return {
    bookingReference: booking.reference,
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    customerPhone: booking.customer_phone,
    requestedDate: formatBusinessDate(requestedStart),
    requestedTime: formatBusinessTime(requestedStart),
    serviceLabel: getServicePackage(toPackageId(booking.package_id)).label,
    vehicleLabel: vehicleLabel || "Vehicle details",
    addressSummary: booking.postcode,
    estimatedTotal: formatMoneyGBP(booking.estimated_total_minor),
    depositPaid: formatMoneyGBP(booking.deposit_paid_minor),
    remainingBalance: formatMoneyGBP(booking.balance_due_minor),
    statusLabel,
  };
}

async function getRescheduleBookingForUpdate(client: PoolClient, reference: string) {
  const result = await client.query<RescheduleResponseRow>(
    `
      SELECT
        b.id,
        b.reference,
        b.status,
        b.package_id,
        b.requested_start_at,
        b.reschedule_proposed_start_at,
        b.reschedule_message,
        b.service_duration_minutes,
        b.travel_buffer_minutes,
        b.estimated_total_minor,
        b.deposit_paid_minor,
        b.balance_due_minor,
        b.postcode,
        c.full_name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,
        v.make AS vehicle_make,
        v.model AS vehicle_model,
        v.size AS vehicle_size
      FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      LEFT JOIN vehicles v ON v.booking_id = b.id AND v.is_primary = true
      WHERE b.reference = $1
      LIMIT 1
      FOR UPDATE OF b
    `,
    [reference],
  );

  return result.rows[0] ?? null;
}

function validateReference(reference: string): RescheduleFailureResult | null {
  if (!isDatabaseConfigured()) {
    return {
      success: false,
      code: "BOOKING_DATABASE_NOT_CONFIGURED",
      message: "Booking status actions are not connected to database persistence yet.",
    };
  }

  if (!isPublicBookingReference(reference)) {
    return {
      success: false,
      code: "INVALID_BOOKING_REFERENCE",
      message: "Booking reference is invalid.",
    };
  }

  return null;
}

function validateRescheduleState(
  booking: RescheduleResponseRow,
  action: RescheduleResponseAction,
): RescheduleFailureResult | null {
  if (booking.status !== "reschedule_requested") {
    return {
      success: false,
      code: "RESCHEDULE_NOT_WAITING_FOR_CUSTOMER",
      message: "This booking is not waiting for a reschedule response.",
    };
  }

  if (!booking.reschedule_proposed_start_at) {
    return {
      success: false,
      code: "RESCHEDULE_TIME_MISSING",
      message: "The suggested time is missing. Contact AUTO VALET to confirm the next step.",
    };
  }

  const transition = canTransitionBookingStatus(
    booking.status as BookingStatus,
    action === "accept" ? "approved" : "pending_admin_review",
    {
      actor: "customer",
      reason:
        action === "accept"
          ? "Customer accepted the reschedule suggestion."
          : "Customer could not accept the reschedule suggestion.",
    },
  );

  if (!transition.allowed) {
    return {
      success: false,
      code: "RESCHEDULE_TRANSITION_BLOCKED",
      message: transition.message,
    };
  }

  return null;
}

async function writeCustomerAuditLog(
  client: PoolClient,
  input: {
    bookingId: string;
    action: string;
    metadata?: Record<string, unknown>;
  },
) {
  await client.query(
    `
      INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
      VALUES ($1, NULL, 'booking', $2, $3, $4::jsonb)
    `,
    [randomUUID(), input.bookingId, input.action, JSON.stringify(input.metadata ?? {})],
  );
}

export async function acceptRescheduleOffer(reference: string): Promise<RescheduleResponseResult> {
  const normalizedReference = reference.trim();
  const referenceError = validateReference(normalizedReference);

  if (referenceError) return referenceError;

  let accepted: AcceptTransactionResult;
  try {
    accepted = await transaction(async (client): Promise<AcceptTransactionResult> => {
      const booking = await getRescheduleBookingForUpdate(client, normalizedReference);

      if (!booking) {
        return {
          success: false,
          code: "BOOKING_NOT_FOUND",
          message: "Booking was not found.",
        };
      }

      const stateError = validateRescheduleState(booking, "accept");

      if (stateError) return stateError;

      const proposedStart = new Date(toIsoString(booking.reschedule_proposed_start_at));

      if (Number.isNaN(proposedStart.getTime()) || proposedStart.getTime() <= Date.now()) {
        return {
          success: false,
          code: "RESCHEDULE_TIME_EXPIRED",
          message: "The suggested time has passed. Contact AUTO VALET to arrange another time.",
        };
      }

      const serviceEndsAt = addMinutes(proposedStart, booking.service_duration_minutes);
      const blockedUntil = addMinutes(
        proposedStart,
        booking.service_duration_minutes + booking.travel_buffer_minutes,
      );
      const conflict = await client.query<{ id: string }>(
        `
          SELECT id
          FROM bookings
          WHERE id <> $1
            AND status = ANY($2::text[])
            AND requested_start_at < $4::timestamptz
            AND blocked_until > $3::timestamptz
          LIMIT 1
        `,
        [
          booking.id,
          [...calendarBlockingStatuses],
          proposedStart.toISOString(),
          blockedUntil.toISOString(),
        ],
      );

      if (conflict.rows[0]) {
        throw new Error("RESCHEDULE_SLOT_TAKEN");
      }

      await client.query(
        `
          UPDATE bookings
          SET status = 'approved',
            requested_start_at = $2::timestamptz,
            service_ends_at = $3::timestamptz,
            blocked_until = $4::timestamptz,
            reschedule_proposed_start_at = NULL,
            reschedule_message = NULL,
            approved_at = COALESCE(approved_at, now()),
            updated_at = now()
          WHERE id = $1
        `,
        [
          booking.id,
          proposedStart.toISOString(),
          serviceEndsAt.toISOString(),
          blockedUntil.toISOString(),
        ],
      );

      await writeCustomerAuditLog(client, {
        bookingId: booking.id,
        action: "reschedule_accepted_by_customer",
        metadata: {
          proposedStartAt: proposedStart.toISOString(),
        },
      });

      return {
        success: true,
        bookingReference: booking.reference,
        status: "approved",
        statusLabel: "Confirmed",
        requestedStartLabel: formatBusinessDateTime(proposedStart),
        booking,
        proposedStart,
      };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RESCHEDULE_SLOT_TAKEN") {
      return {
        success: false,
        code: "RESCHEDULE_SLOT_TAKEN",
        message: "That suggested time has just been taken. Contact AUTO VALET to arrange another time.",
      };
    }

    return {
      success: false,
      code: "RESCHEDULE_ACCEPT_FAILED",
      message: "The suggested time could not be accepted. Try again or contact AUTO VALET.",
    };
  }

  if (!accepted.success) return accepted;

  await dispatchBookingUpdateNotifications(
    "booking_approved",
    buildNotificationSummary(accepted.booking, accepted.proposedStart, "Confirmed"),
    {
      customerActionUrl: createPublicBookingStatusUrl(accepted.booking.reference),
      adminActionUrl: createAdminBookingUrl(accepted.booking.id),
    },
  );

  return {
    success: true,
    bookingReference: accepted.booking.reference,
    status: "approved",
    statusLabel: "Confirmed",
    requestedStartLabel: formatBusinessDateTime(accepted.proposedStart),
  };
}

export async function declineRescheduleOffer(reference: string): Promise<RescheduleResponseResult> {
  const normalizedReference = reference.trim();
  const referenceError = validateReference(normalizedReference);

  if (referenceError) return referenceError;

  return transaction(async (client) => {
    const booking = await getRescheduleBookingForUpdate(client, normalizedReference);

    if (!booking) {
      return {
        success: false,
        code: "BOOKING_NOT_FOUND",
        message: "Booking was not found.",
      };
    }

    const stateError = validateRescheduleState(booking, "decline");

    if (stateError) return stateError;

    await client.query(
      `
        UPDATE bookings
        SET status = 'pending_admin_review',
          reschedule_proposed_start_at = NULL,
          reschedule_message = NULL,
          updated_at = now()
        WHERE id = $1
      `,
      [booking.id],
    );

    await writeCustomerAuditLog(client, {
      bookingId: booking.id,
      action: "reschedule_declined_by_customer",
      metadata: {
        proposedStartAt: toIsoString(booking.reschedule_proposed_start_at),
      },
    });

    return {
      success: true,
      bookingReference: booking.reference,
      status: "pending_admin_review",
      statusLabel: "Waiting for approval",
    };
  });
}
