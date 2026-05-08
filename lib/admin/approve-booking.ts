import type { CalendarBlockingBooking } from "../availability";
import { hasOverlap, isCalendarBlockingStatus } from "../availability/conflicts";
import { canTransitionBookingStatus } from "../booking/lifecycle";
import { dispatchNotification } from "../notifications/dispatcher";
import type { AdminBookingDetailData } from "./booking-detail";

export type ApproveBookingInput = {
  bookingId: string;
  adminId: string;
};

export type ApproveBookingResult =
  | {
      success: true;
      bookingId: string;
      status: "approved";
      approvedAt: string;
    }
  | {
      success: false;
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

export type ApproveBookingOptions = {
  adminAuthenticated?: boolean;
  canApproveBooking?: boolean;
  persistenceConfigured?: boolean;
  booking?: AdminBookingDetailData;
  existingBookings?: CalendarBlockingBooking[];
};

function hasCalendarConflict(booking: AdminBookingDetailData, existingBookings: CalendarBlockingBooking[] = []) {
  const requestedStart = new Date(booking.schedule.requestedStartAt);
  const blockedUntil = new Date(booking.schedule.blockedUntil);

  if (Number.isNaN(requestedStart.getTime()) || Number.isNaN(blockedUntil.getTime())) {
    return true;
  }

  return existingBookings
    .filter((existingBooking) => existingBooking.id !== booking.id)
    .filter((existingBooking) => isCalendarBlockingStatus(existingBooking.status))
    .some((existingBooking) => {
      const existingStart = new Date(existingBooking.requestedStartAt);
      const existingBlockedUntil = new Date(existingBooking.blockedUntil);

      if (Number.isNaN(existingStart.getTime()) || Number.isNaN(existingBlockedUntil.getTime())) {
        return false;
      }

      return hasOverlap(requestedStart, blockedUntil, existingStart, existingBlockedUntil);
    });
}

function validateBookingReadyForApproval(booking: AdminBookingDetailData, existingBookings: CalendarBlockingBooking[]) {
  const errors: string[] = [];

  if (booking.status !== "pending_admin_review") {
    errors.push("Only bookings waiting for approval can be approved.");
  }

  if (booking.financials.depositPaidMinor <= 0) {
    errors.push("Deposit is not confirmed.");
  }

  if (hasCalendarConflict(booking, existingBookings)) {
    errors.push("Requested time has a calendar conflict.");
  }

  if (!booking.customer.fullName.trim() || !booking.customer.phone.trim() || !booking.customer.email.trim()) {
    errors.push("Customer details are incomplete.");
  }

  if (!booking.vehicle.make.trim() || !booking.vehicle.model.trim() || !booking.vehicle.size) {
    errors.push("Vehicle details are incomplete.");
  }

  if (booking.location.zoneLabel === "Outside service area") {
    errors.push("Location is outside the service area.");
  }

  if (!booking.serviceEndLabel.trim() || !booking.blockedUntilLabel.trim()) {
    errors.push("Service duration or blocked time is missing.");
  }

  const transition = canTransitionBookingStatus(booking.status, "approved", {
    actor: "admin",
    reason: "Admin approved booking request.",
  });

  if (!transition.allowed) {
    errors.push(transition.message);
  }

  return errors;
}

async function dispatchApprovalNotification(booking: AdminBookingDetailData) {
  await dispatchNotification({
    eventType: "booking_approved",
    channel: "email",
    recipientType: "customer",
    to: booking.customer.email,
    booking: {
      bookingReference: booking.reference,
      customerName: booking.customer.fullName,
      customerEmail: booking.customer.email,
      customerPhone: booking.customer.phone,
      requestedDate: booking.requestedDateLabel,
      requestedTime: booking.requestedTimeLabel,
      serviceLabel: booking.serviceLabel,
      vehicleLabel: booking.vehicle.label,
      addressSummary: booking.location.postcode,
      estimatedTotal: booking.payment.estimatedTotalLabel,
      depositPaid: booking.payment.depositPaidLabel,
      remainingBalance: booking.payment.balanceDueLabel,
      statusLabel: "Confirmed",
      zoneStatusLabel: booking.location.zoneLabel,
      isOutsideZoneRequest: booking.location.isOutsideZone,
    },
  });
}

export async function approveBooking(
  input: ApproveBookingInput,
  options: ApproveBookingOptions = {},
): Promise<ApproveBookingResult> {
  if (!input.bookingId.trim()) {
    return {
      success: false,
      code: "APPROVE_BOOKING_VALIDATION_FAILED",
      message: "Booking id is required.",
    };
  }

  if (!input.adminId.trim()) {
    return {
      success: false,
      code: "APPROVE_BOOKING_VALIDATION_FAILED",
      message: "Admin id is required.",
    };
  }

  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_NOT_CONFIGURED",
      message: "Admin authentication is not configured yet.",
    };
  }

  if (!options.canApproveBooking) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot approve bookings.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  const validationErrors = validateBookingReadyForApproval(
    options.booking,
    options.existingBookings ?? [],
  );

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: validationErrors.some((error) => error.includes("conflict"))
        ? "APPROVAL_CONFLICT"
        : "APPROVAL_VALIDATION_FAILED",
      message: validationErrors.join(" "),
      details: {
        errors: validationErrors,
      },
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "APPROVAL_PERSISTENCE_NOT_CONFIGURED",
      message: "Booking approval is not connected to database persistence yet.",
      details: {
        reason: "Status, approved_at, audit log and notifications require persistence.",
      },
    };
  }

  // TODO: Lock the booking row, re-check conflicts in the same transaction, update status and approved_at, and write audit logs.
  const approvedAt = new Date().toISOString();

  // Notification failure must not roll back a persisted approval; surface it later through admin logs.
  await dispatchApprovalNotification(options.booking);

  return {
    success: true,
    bookingId: input.bookingId,
    status: "approved",
    approvedAt,
  };
}
