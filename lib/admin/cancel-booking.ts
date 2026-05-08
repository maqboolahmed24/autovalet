import { canTransitionBookingStatus } from "../booking/lifecycle";
import type { BookingStatus } from "../booking/types";
import {
  evaluateCancellationPolicy,
  isDepositAction,
  type CancellationActor,
  type CancellationReason,
  type DepositAction,
} from "../policies";

export type CancelBookingInput = {
  bookingId: string;
  adminId: string;
  actor: CancellationActor;
  reason: CancellationReason;
  depositAction?: DepositAction;
  notes?: string;
};

export type CancelBookingSnapshot = {
  id: string;
  status: BookingStatus;
  appointmentStartAt?: string;
  depositPaidMinor: number;
};

export type CancelBookingResult =
  | {
      success: true;
      bookingId: string;
      status: BookingStatus;
      depositAction: DepositAction;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type CancelBookingOptions = {
  adminAuthenticated?: boolean;
  canCancelBooking?: boolean;
  persistenceConfigured?: boolean;
  booking?: CancelBookingSnapshot;
  now?: string;
};

function validateCancelBookingInput(input: CancelBookingInput) {
  const errors: string[] = [];

  if (!input.bookingId.trim()) errors.push("Booking id is required.");
  if (!input.adminId.trim()) errors.push("Admin id is required.");
  if (!input.reason) errors.push("Cancellation reason is required.");
  if (input.depositAction && !isDepositAction(input.depositAction)) {
    errors.push("Deposit action is invalid.");
  }

  return errors;
}

export async function cancelBooking(
  input: CancelBookingInput,
  options: CancelBookingOptions = {},
): Promise<CancelBookingResult> {
  const validationErrors = validateCancelBookingInput(input);

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "CANCELLATION_VALIDATION_FAILED",
      message: validationErrors.join(" "),
    };
  }

  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_NOT_CONFIGURED",
      message: "Admin authentication is not configured yet.",
    };
  }

  if (!options.canCancelBooking) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot cancel bookings.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  const decision = evaluateCancellationPolicy({
    bookingStatus: options.booking.status,
    actor: input.actor,
    reason: input.reason,
    appointmentStartAt: options.booking.appointmentStartAt,
    now: options.now,
    depositPaidMinor: options.booking.depositPaidMinor,
  });

  if (!decision.allowed) {
    return {
      success: false,
      code: "CANCELLATION_POLICY_BLOCKED",
      message: decision.message,
    };
  }

  const depositAction = input.depositAction ?? decision.defaultDepositAction;

  if (!decision.allowedDepositActions.includes(depositAction)) {
    return {
      success: false,
      code: "DEPOSIT_ACTION_NOT_ALLOWED",
      message: "This deposit action is not allowed for the selected cancellation policy.",
    };
  }

  const transition = canTransitionBookingStatus(
    options.booking.status,
    decision.recommendedBookingStatus,
    {
      actor: input.actor === "customer" ? "customer" : "admin",
      reason: input.reason,
    },
  );

  if (!transition.allowed) {
    return {
      success: false,
      code: "CANCELLATION_TRANSITION_BLOCKED",
      message: transition.message,
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "CANCELLATION_PERSISTENCE_NOT_CONFIGURED",
      message: "Cancellation persistence is not connected yet.",
    };
  }

  // TODO: Update booking status, cancellation fields, deposit action marker and audit log in one transaction.
  // TODO: Dispatch `booking_cancelled` after persistence succeeds. If this cancellation is an
  // admin decline/reschedule path, dispatch the matching decline/reschedule template from that workflow.
  return {
    success: true,
    bookingId: input.bookingId,
    status: decision.recommendedBookingStatus,
    depositAction,
  };
}
