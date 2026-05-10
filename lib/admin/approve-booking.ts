import type { CalendarBlockingBooking } from "../availability";
import { hasOverlap, isCalendarBlockingStatus } from "../availability/conflicts";
import { canTransitionBookingStatus } from "../booking/lifecycle";
import { arePaymentsEnabled } from "../config/features";
import {
  approveBookingRecord,
  BookingPersistenceError,
  SlotUnavailableError,
} from "../db/booking-repository";
import {
  buildNotificationSummaryFromAdminBooking,
  createAdminBookingUrl,
  createPublicBookingStatusUrl,
} from "../notifications/booking-summary";
import { dispatchBookingUpdateNotifications } from "../notifications/workflows";
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

  if (arePaymentsEnabled() && booking.financials.depositPaidMinor <= 0) {
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
  await dispatchBookingUpdateNotifications(
    "booking_approved",
    buildNotificationSummaryFromAdminBooking(booking, {
      statusLabel: "Confirmed",
    }),
    {
      customerActionUrl: createPublicBookingStatusUrl(booking.reference),
      adminActionUrl: createAdminBookingUrl(booking.id),
    },
  );
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

  try {
    const savedApproval = await approveBookingRecord(input.bookingId, input.adminId);
    await dispatchApprovalNotification(options.booking);

    return {
      success: true,
      bookingId: input.bookingId,
      status: "approved",
      approvedAt: savedApproval.approvedAt,
    };
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return {
        success: false,
        code: "APPROVAL_CONFLICT",
        message: error.message,
      };
    }

    if (error instanceof BookingPersistenceError) {
      return {
        success: false,
        code: "APPROVAL_VALIDATION_FAILED",
        message: error.message,
      };
    }

    return {
      success: false,
      code: "APPROVAL_PERSISTENCE_FAILED",
      message: "Booking approval could not be saved.",
    };
  }
}
