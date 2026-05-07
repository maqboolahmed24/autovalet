import type { BookingStatus } from "../booking/types";
import { calculateBalanceDueMinor, type BookingBalanceSnapshot } from "../payments/balance";

export type AdjustFinalPriceInput = {
  bookingId: string;
  finalTotalMinor: number;
  reason: string;
  adminId: string;
};

export type AdjustFinalPriceResult =
  | {
      success: true;
      finalTotalMinor: number;
      balanceDueMinor: number;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type AdjustFinalPriceOptions = {
  adminAuthenticated?: boolean;
  canAdjustFinalPrice?: boolean;
  persistenceConfigured?: boolean;
  booking?: BookingBalanceSnapshot;
  allowFinalTotalBelowDeposit?: boolean;
};

export const finalPriceAdjustmentStatuses = [
  "approved",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
] as const satisfies readonly BookingStatus[];

export function canAdjustFinalPriceForStatus(status: BookingStatus) {
  return (finalPriceAdjustmentStatuses as readonly BookingStatus[]).includes(status);
}

export function validateFinalPriceAdjustmentInput(
  input: AdjustFinalPriceInput,
  booking?: BookingBalanceSnapshot,
  options: Pick<AdjustFinalPriceOptions, "allowFinalTotalBelowDeposit"> = {},
) {
  const errors: string[] = [];

  if (!input.bookingId.trim()) errors.push("Booking id is required.");
  if (!input.adminId.trim()) errors.push("Admin id is required.");
  if (!Number.isInteger(input.finalTotalMinor) || input.finalTotalMinor < 0) {
    errors.push("Final price must be zero or more.");
  }
  if (input.reason.trim().length < 5) {
    errors.push("Reason for adjustment must be at least 5 characters.");
  }

  if (booking) {
    if (!canAdjustFinalPriceForStatus(booking.status)) {
      errors.push("Final price cannot be adjusted for this booking status.");
    }
    if (input.finalTotalMinor < booking.depositPaidMinor && !options.allowFinalTotalBelowDeposit) {
      errors.push("Final price is lower than the deposit paid. Use a refund flow or admin override.");
    }
  }

  return errors;
}

export function previewFinalPriceAdjustment(input: AdjustFinalPriceInput, booking: BookingBalanceSnapshot) {
  return {
    finalTotalMinor: input.finalTotalMinor,
    balanceDueMinor: calculateBalanceDueMinor({
      finalTotalMinor: input.finalTotalMinor,
      estimatedTotalMinor: booking.estimatedTotalMinor,
      depositPaidMinor: booking.depositPaidMinor,
      balancePaidMinor: booking.balancePaidMinor,
    }),
  };
}

export async function adjustFinalPrice(
  input: AdjustFinalPriceInput,
  options: AdjustFinalPriceOptions = {},
): Promise<AdjustFinalPriceResult> {
  const validationErrors = validateFinalPriceAdjustmentInput(input, options.booking, {
    allowFinalTotalBelowDeposit: options.allowFinalTotalBelowDeposit,
  });

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "FINAL_PRICE_VALIDATION_FAILED",
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

  if (!options.canAdjustFinalPrice) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot adjust final prices.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  const preview = previewFinalPriceAdjustment(input, options.booking);

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "FINAL_PRICE_PERSISTENCE_NOT_CONFIGURED",
      message: "Final price adjustment is not connected to database persistence yet.",
    };
  }

  // TODO: Update final_total_minor, balance_due_minor, price_adjustment_reason and audit log in one transaction.
  return {
    success: true,
    finalTotalMinor: preview.finalTotalMinor,
    balanceDueMinor: preview.balanceDueMinor,
  };
}
