import { canTransitionBookingStatus } from "../booking/lifecycle";
import type { DepositAction } from "../policies";
import { arePaymentsEnabled } from "../config/features";
import { BookingPersistenceError, declineBookingRecord } from "../db/booking-repository";
import {
  buildNotificationSummaryFromAdminBooking,
  createAdminBookingUrl,
  createPublicBookingStatusUrl,
} from "../notifications/booking-summary";
import { dispatchBookingUpdateNotifications } from "../notifications/workflows";
import type { AdminBookingDetailData } from "./booking-detail";

export type DeclineReason =
  | "outside_service_area"
  | "slot_no_longer_suitable"
  | "vehicle_or_service_unsuitable"
  | "customer_requested"
  | "duplicate_request"
  | "other";

export type DeclineBookingInput = {
  bookingId: string;
  adminId: string;
  reason: DeclineReason;
  notes?: string;
  depositAction: DepositAction;
};

export type DeclineBookingResult =
  | {
      success: true;
      bookingId: string;
      status: "declined";
      depositAction: DepositAction;
    }
  | {
      success: false;
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

export type DeclineBookingOptions = {
  adminAuthenticated?: boolean;
  canDeclineBooking?: boolean;
  persistenceConfigured?: boolean;
  booking?: AdminBookingDetailData;
};

export const declineReasons = [
  "outside_service_area",
  "slot_no_longer_suitable",
  "vehicle_or_service_unsuitable",
  "customer_requested",
  "duplicate_request",
  "other",
] as const satisfies readonly DeclineReason[];

export const declineReasonLabels: Record<DeclineReason, string> = {
  outside_service_area: "Outside service area",
  slot_no_longer_suitable: "Slot no longer suitable",
  vehicle_or_service_unsuitable: "Vehicle or service unsuitable",
  customer_requested: "Customer requested",
  duplicate_request: "Duplicate request",
  other: "Other",
};

export function isDeclineReason(value: unknown): value is DeclineReason {
  return declineReasons.includes(value as DeclineReason);
}

function validateDecline(input: DeclineBookingInput, booking: AdminBookingDetailData) {
  const errors: string[] = [];

  if (booking.status !== "pending_admin_review") {
    errors.push("Only bookings waiting for approval can be declined.");
  }

  const transition = canTransitionBookingStatus(booking.status, "declined", {
    actor: "admin",
    reason: input.reason,
  });

  if (!transition.allowed) {
    errors.push(transition.message);
  }

  if (
    arePaymentsEnabled() &&
    booking.financials.depositPaidMinor > 0 &&
    input.depositAction === "no_deposit_action_required"
  ) {
    errors.push("Choose refund or transfer when a deposit has been paid.");
  }

  if (
    (!arePaymentsEnabled() || booking.financials.depositPaidMinor <= 0) &&
    input.depositAction !== "no_deposit_action_required"
  ) {
    errors.push("No deposit is recorded, so no deposit action is required.");
  }

  return errors;
}

async function dispatchDeclineNotification(booking: AdminBookingDetailData, reason: string) {
  await dispatchBookingUpdateNotifications(
    "booking_declined",
    buildNotificationSummaryFromAdminBooking(booking, {
      statusLabel: "Declined",
    }),
    {
      reason,
      customerActionUrl: createPublicBookingStatusUrl(booking.reference),
      adminActionUrl: createAdminBookingUrl(booking.id),
    },
  );
}

export async function declineBooking(
  input: DeclineBookingInput,
  options: DeclineBookingOptions = {},
): Promise<DeclineBookingResult> {
  if (!input.bookingId.trim() || !input.adminId.trim()) {
    return {
      success: false,
      code: "DECLINE_BOOKING_VALIDATION_FAILED",
      message: "Booking id and admin id are required.",
    };
  }

  if (!isDeclineReason(input.reason)) {
    return {
      success: false,
      code: "DECLINE_BOOKING_VALIDATION_FAILED",
      message: "Decline reason is invalid.",
    };
  }

  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_NOT_CONFIGURED",
      message: "Admin authentication is not configured yet.",
    };
  }

  if (!options.canDeclineBooking) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot decline bookings.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  const errors = validateDecline(input, options.booking);

  if (errors.length > 0) {
    return {
      success: false,
      code: "DECLINE_TRANSITION_BLOCKED",
      message: errors.join(" "),
      details: { errors },
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "DECLINE_PERSISTENCE_NOT_CONFIGURED",
      message: "Booking decline is not connected to database persistence yet.",
      details: {
        reason: "Status, slot release, audit log and deposit action require persistence.",
      },
    };
  }

  try {
    await declineBookingRecord({
      bookingId: input.bookingId,
      adminId: input.adminId,
      reason: input.reason,
      notes: input.notes,
    });
    await dispatchDeclineNotification(options.booking, declineReasonLabels[input.reason]);

    return {
      success: true,
      bookingId: input.bookingId,
      status: "declined",
      depositAction: input.depositAction,
    };
  } catch (error) {
    if (error instanceof BookingPersistenceError) {
      return {
        success: false,
        code: "DECLINE_TRANSITION_BLOCKED",
        message: error.message,
      };
    }

    return {
      success: false,
      code: "DECLINE_PERSISTENCE_FAILED",
      message: "Booking decline could not be saved.",
    };
  }
}
