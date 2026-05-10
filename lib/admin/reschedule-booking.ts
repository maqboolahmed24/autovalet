import { randomUUID } from "node:crypto";
import type { CalendarBlockingBooking } from "../availability";
import { createUtcDateFromBusinessTime, generateAvailableSlots } from "../availability";
import type { AvailabilityOverride, WorkingHoursRule } from "../availability";
import { isValidDateString, isValidTimeString } from "../availability/working-hours";
import { canTransitionBookingStatus } from "../booking/lifecycle";
import type { BookingDraft } from "../booking/types";
import { transaction } from "../db/postgres";
import { calculateBookingDuration } from "../pricing";
import type { AdminServicesPricingData } from "./services-pricing";
import { calculateBookingDurationWithAdminPricing } from "./services-pricing";
import {
  buildNotificationSummaryFromAdminBooking,
  createAdminBookingUrl,
  createPublicBookingStatusUrl,
} from "../notifications/booking-summary";
import { dispatchBookingUpdateNotifications } from "../notifications/workflows";
import type { AdminBookingDetailData } from "./booking-detail";

export type ProposeRescheduleInput = {
  bookingId: string;
  adminId: string;
  proposedDate: string;
  proposedStartTime: string;
  message?: string;
};

export type ProposeRescheduleResult =
  | {
      success: true;
      bookingId: string;
      status: "reschedule_requested";
      proposedDate: string;
      proposedStartTime: string;
      customerActionUrl: string;
    }
  | {
      success: false;
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

export type ProposeRescheduleOptions = {
  adminAuthenticated?: boolean;
  canRescheduleBooking?: boolean;
  persistenceConfigured?: boolean;
  booking?: AdminBookingDetailData;
  existingBookings?: CalendarBlockingBooking[];
  workingHoursRules?: WorkingHoursRule[];
  availabilityOverrides?: AvailabilityOverride[];
  pricingData?: AdminServicesPricingData;
};

function isValidDate(value: string) {
  return isValidDateString(value);
}

function isValidTime(value: string) {
  return isValidTimeString(value);
}

function isProposedStartInPast(date: string, time: string, now = new Date()) {
  if (!isValidDateString(date) || !isValidTimeString(time)) {
    return false;
  }

  return createUtcDateFromBusinessTime(date, time).getTime() <= now.getTime();
}

function createDraftForDuration(booking: AdminBookingDetailData): BookingDraft {
  return {
    packageId: booking.packageId,
    vehicles: [
      {
        id: "vehicle-1",
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        size: booking.vehicle.size,
        addons: booking.addons.map((addon) => addon.id),
      },
    ],
    postcode: booking.location.postcode,
    fullAddress: booking.location.fullAddress,
    parkingAvailable: "",
    parkingNotes: booking.location.parkingNotes ?? "",
    accessNotes: booking.location.accessNotes ?? "",
    zoneCheckStatus: booking.location.isOutsideZone ? "outside_zone_volume_allowed" : "standard_zone",
    vehicleCount: 1,
    selectedDate: "",
    selectedSlotStart: "",
    customer: {
      fullName: booking.customer.fullName,
      phone: booking.customer.phone,
      email: booking.customer.email,
    },
    extraNotes: booking.notes.customerNotes ?? "",
    marketingPhotoConsent: false,
  };
}

function proposedSlotIsAvailable(
  booking: AdminBookingDetailData,
  input: ProposeRescheduleInput,
  existingBookings: CalendarBlockingBooking[],
  availability: {
    workingHoursRules?: WorkingHoursRule[];
    overrides?: AvailabilityOverride[];
    pricingData?: AdminServicesPricingData;
  } = {},
) {
  const draft = createDraftForDuration(booking);
  const duration = availability.pricingData
    ? calculateBookingDurationWithAdminPricing(draft, availability.pricingData)
    : calculateBookingDuration(draft);
  const slots = generateAvailableSlots({
    date: input.proposedDate,
    serviceDurationMinutes: duration.serviceDurationMinutes,
    travelBufferMinutes: duration.travelBufferMinutes,
    workingHoursRules: availability.workingHoursRules,
    overrides: availability.overrides,
    existingBookings: existingBookings.filter((existingBooking) => existingBooking.id !== booking.id),
    allowExtendedServiceRequest: true,
  });

  return slots.some((slot) => slot.label === input.proposedStartTime);
}

function validateReschedule(
  input: ProposeRescheduleInput,
  booking: AdminBookingDetailData,
  existingBookings: CalendarBlockingBooking[],
  availability: {
    workingHoursRules?: WorkingHoursRule[];
    overrides?: AvailabilityOverride[];
    pricingData?: AdminServicesPricingData;
  } = {},
) {
  const errors: string[] = [];
  const proposedDateIsValid = isValidDate(input.proposedDate);
  const proposedTimeIsValid = isValidTime(input.proposedStartTime);
  const proposedStartIsPast =
    proposedDateIsValid &&
    proposedTimeIsValid &&
    isProposedStartInPast(input.proposedDate, input.proposedStartTime);

  if (!["pending_admin_review", "approved", "reschedule_requested"].includes(booking.status)) {
    errors.push("This booking status cannot receive a reschedule suggestion.");
  }

  if (!proposedDateIsValid) {
    errors.push("Choose a valid proposed date.");
  }

  if (!proposedTimeIsValid) {
    errors.push("Choose a valid proposed time.");
  }

  if (proposedStartIsPast) {
    errors.push("Choose a future proposed time.");
  }

  if (booking.status !== "reschedule_requested") {
    const transition = canTransitionBookingStatus(booking.status, "reschedule_requested", {
      actor: "admin",
      reason: "Admin proposed a new booking time.",
    });

    if (!transition.allowed) {
      errors.push(transition.message);
    }
  }

  if (
    proposedDateIsValid &&
    proposedTimeIsValid &&
    !proposedStartIsPast &&
    !proposedSlotIsAvailable(booking, input, existingBookings, availability)
  ) {
    errors.push("The proposed time is not available.");
  }

  return errors;
}

async function dispatchRescheduleNotification(booking: AdminBookingDetailData, input: ProposeRescheduleInput) {
  await dispatchBookingUpdateNotifications(
    "reschedule_suggested",
    buildNotificationSummaryFromAdminBooking(booking, {
      requestedDate: input.proposedDate,
      requestedTime: input.proposedStartTime,
      statusLabel: "New time suggested",
    }),
    {
      reason: input.message,
      customerActionUrl: createPublicBookingStatusUrl(booking.reference),
      adminActionUrl: createAdminBookingUrl(booking.id),
    },
  );
}

export async function proposeReschedule(
  input: ProposeRescheduleInput,
  options: ProposeRescheduleOptions = {},
): Promise<ProposeRescheduleResult> {
  if (!input.bookingId.trim() || !input.adminId.trim()) {
    return {
      success: false,
      code: "RESCHEDULE_VALIDATION_FAILED",
      message: "Booking id and admin id are required.",
    };
  }

  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_NOT_CONFIGURED",
      message: "Admin authentication is not configured yet.",
    };
  }

  if (!options.canRescheduleBooking) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot reschedule bookings.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  const errors = validateReschedule(input, options.booking, options.existingBookings ?? [], {
    workingHoursRules: options.workingHoursRules,
    overrides: options.availabilityOverrides,
    pricingData: options.pricingData,
  });

  if (errors.length > 0) {
    return {
      success: false,
      code: errors.some((error) => error.includes("not available"))
        ? "RESCHEDULE_SLOT_UNAVAILABLE"
        : "RESCHEDULE_VALIDATION_FAILED",
      message: errors.join(" "),
      details: { errors },
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "RESCHEDULE_PERSISTENCE_NOT_CONFIGURED",
      message: "Reschedule suggestions are not connected to database persistence yet.",
      details: {
        reason: "Proposed start time, expiry, audit log and customer action URL require persistence.",
      },
    };
  }

  try {
    const proposedStart = createUtcDateFromBusinessTime(input.proposedDate, input.proposedStartTime);
    const updated = await transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `
          UPDATE bookings
          SET status = 'reschedule_requested',
            reschedule_proposed_start_at = $2::timestamptz,
            reschedule_message = $3,
            updated_at = now()
          WHERE id = $1
          RETURNING id
        `,
        [input.bookingId, proposedStart.toISOString(), input.message?.trim() || null],
      );

      if (!result.rows[0]) {
        return false;
      }

      await client.query(
        `
          INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
          VALUES ($1, $2, 'booking', $3, 'reschedule_suggested', $4::jsonb)
        `,
        [
          randomUUID(),
          input.adminId,
          input.bookingId,
          JSON.stringify({
            proposedDate: input.proposedDate,
            proposedStartTime: input.proposedStartTime,
          }),
        ],
      );

      return true;
    });

    if (!updated) {
      return {
        success: false,
        code: "BOOKING_NOT_FOUND",
        message: "Booking was not found.",
      };
    }

    await dispatchRescheduleNotification(options.booking, input);

    return {
      success: true,
      bookingId: input.bookingId,
      status: "reschedule_requested",
      proposedDate: input.proposedDate,
      proposedStartTime: input.proposedStartTime,
      customerActionUrl: `/booking/status/${encodeURIComponent(options.booking.reference)}`,
    };
  } catch (error) {
    return {
      success: false,
      code: "RESCHEDULE_PERSISTENCE_FAILED",
      message: error instanceof Error ? error.message : "Reschedule suggestion could not be saved.",
    };
  }
}
