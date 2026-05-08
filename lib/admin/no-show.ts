import { canTransitionBookingStatus } from "../booking/lifecycle";
import type { BookingStatus } from "../booking/types";
import type { DepositAction, NoShowReason } from "../policies";

export type MarkNoShowInput = {
  bookingId: string;
  adminId: string;
  reason: NoShowReason;
  notes?: string;
};

export type MarkNoShowResult =
  | {
      success: true;
      bookingId: string;
      status: "no_show";
      depositAction: DepositAction;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type MarkNoShowOptions = {
  adminAuthenticated?: boolean;
  canMarkNoShow?: boolean;
  persistenceConfigured?: boolean;
  booking?: {
    id: string;
    status: BookingStatus;
    depositPaidMinor: number;
  };
};

const allowedNoShowStatuses = ["approved", "on_the_way", "arrived"] as const satisfies readonly BookingStatus[];

export function canMarkNoShowFromStatus(status: BookingStatus) {
  return (allowedNoShowStatuses as readonly BookingStatus[]).includes(status);
}

function validateMarkNoShowInput(input: MarkNoShowInput) {
  const errors: string[] = [];

  if (!input.bookingId.trim()) errors.push("Booking id is required.");
  if (!input.adminId.trim()) errors.push("Admin id is required.");
  if (!input.reason) errors.push("No-show reason is required.");

  return errors;
}

export async function markNoShow(
  input: MarkNoShowInput,
  options: MarkNoShowOptions = {},
): Promise<MarkNoShowResult> {
  const validationErrors = validateMarkNoShowInput(input);

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "NO_SHOW_VALIDATION_FAILED",
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

  if (!options.canMarkNoShow) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot mark no-show bookings.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  if (!canMarkNoShowFromStatus(options.booking.status)) {
    return {
      success: false,
      code: "NO_SHOW_STATUS_NOT_ALLOWED",
      message: "No-show can only be recorded after approval and before the job starts.",
    };
  }

  const transition = canTransitionBookingStatus(options.booking.status, "no_show", {
    actor: "admin",
    reason: input.reason,
  });

  if (!transition.allowed) {
    return {
      success: false,
      code: "NO_SHOW_TRANSITION_BLOCKED",
      message: transition.message,
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "NO_SHOW_PERSISTENCE_NOT_CONFIGURED",
      message: "No-show persistence is not connected yet.",
    };
  }

  // TODO: Update booking status, record access/no-show reason, keep deposit according to policy, and write audit log.
  // TODO: Dispatch `no_show_recorded` after persistence succeeds.
  return {
    success: true,
    bookingId: input.bookingId,
    status: "no_show",
    depositAction: options.booking.depositPaidMinor > 0 ? "keep_according_to_policy" : "no_deposit_action_required",
  };
}
