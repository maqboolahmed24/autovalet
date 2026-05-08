import type { CalendarBlockingBooking } from "../availability";
import { createUtcDateFromBusinessTime, generateAvailableSlots } from "../availability";
import { isValidDateString, isValidTimeString } from "../availability/working-hours";
import { canTransitionBookingStatus } from "../booking/lifecycle";
import type { BookingDraft } from "../booking/types";
import { calculateBookingDuration } from "../pricing";
import { dispatchNotification } from "../notifications/dispatcher";
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
) {
  const duration = calculateBookingDuration(createDraftForDuration(booking));
  const slots = generateAvailableSlots({
    date: input.proposedDate,
    serviceDurationMinutes: duration.serviceDurationMinutes,
    travelBufferMinutes: duration.travelBufferMinutes,
    existingBookings: existingBookings.filter((existingBooking) => existingBooking.id !== booking.id),
  });

  return slots.some((slot) => slot.label === input.proposedStartTime);
}

function validateReschedule(
  input: ProposeRescheduleInput,
  booking: AdminBookingDetailData,
  existingBookings: CalendarBlockingBooking[],
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
    !proposedSlotIsAvailable(booking, input, existingBookings)
  ) {
    errors.push("The proposed time is not available.");
  }

  return errors;
}

async function dispatchRescheduleNotification(booking: AdminBookingDetailData, input: ProposeRescheduleInput) {
  await dispatchNotification({
    eventType: "reschedule_suggested",
    channel: "email",
    recipientType: "customer",
    to: booking.customer.email,
    reason: input.message,
    actionUrl: `/booking/status/${encodeURIComponent(booking.reference)}`,
    booking: {
      bookingReference: booking.reference,
      customerName: booking.customer.fullName,
      customerEmail: booking.customer.email,
      customerPhone: booking.customer.phone,
      requestedDate: input.proposedDate,
      requestedTime: input.proposedStartTime,
      serviceLabel: booking.serviceLabel,
      vehicleLabel: booking.vehicle.label,
      addressSummary: booking.location.postcode,
      estimatedTotal: booking.payment.estimatedTotalLabel,
      depositPaid: booking.payment.depositPaidLabel,
      remainingBalance: booking.payment.balanceDueLabel,
      statusLabel: "New time suggested",
      zoneStatusLabel: booking.location.zoneLabel,
      isOutsideZoneRequest: booking.location.isOutsideZone,
    },
  });
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

  const errors = validateReschedule(input, options.booking, options.existingBookings ?? []);

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

  return {
    success: false,
    code: "RESCHEDULE_PERSISTENCE_NOT_CONFIGURED",
    message: "Reschedule suggestions are not connected to database persistence yet.",
    details: {
      reason: "Proposed start time, expiry, audit log and customer action URL require persistence.",
    },
  };
}
