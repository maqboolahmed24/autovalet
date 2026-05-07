import type { BookingStatus } from "../booking/types";

export type BalancePaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card_reader"
  | "payment_link"
  | "other";

export type PaymentDisplayStatus =
  | "no_payment_required"
  | "deposit_pending"
  | "deposit_paid"
  | "balance_unpaid"
  | "partially_paid"
  | "fully_paid"
  | "refunded"
  | "partially_refunded"
  | "transferred"
  | "payment_failed";

export type BookingBalanceSnapshot = {
  bookingId: string;
  status: BookingStatus;
  estimatedTotalMinor: number;
  finalTotalMinor: number | null;
  depositPaidMinor: number;
  balanceDueMinor: number;
  balancePaidMinor: number;
  currency: "GBP";
};

export type MarkBalancePaidInput = {
  bookingId: string;
  amountPaidMinor: number;
  paymentMethod: BalancePaymentMethod;
  note?: string;
  paidAt?: string;
  adminId: string;
};

export type MarkBalancePaidResult =
  | {
      success: true;
      balancePaidMinor: number;
      balanceDueMinor: number;
      paymentStatus: PaymentDisplayStatus;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type MarkBalancePaidOptions = {
  adminAuthenticated?: boolean;
  canMarkBalancePaid?: boolean;
  persistenceConfigured?: boolean;
  booking?: BookingBalanceSnapshot;
};

export const balancePaymentStatuses = [
  "approved",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
] as const satisfies readonly BookingStatus[];

export function poundsToMinor(value: string) {
  const normalized = value.replace(/[£,]/g, "").trim();
  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return Math.round(numberValue * 100);
}

export function isBalancePaymentMethod(value: unknown): value is BalancePaymentMethod {
  return (
    value === "cash" ||
    value === "bank_transfer" ||
    value === "card_reader" ||
    value === "payment_link" ||
    value === "other"
  );
}

export function canRecordBalancePaymentForStatus(status: BookingStatus) {
  return (balancePaymentStatuses as readonly BookingStatus[]).includes(status);
}

export function calculateBalanceDueMinor({
  finalTotalMinor,
  estimatedTotalMinor,
  depositPaidMinor,
  balancePaidMinor,
}: {
  finalTotalMinor: number | null;
  estimatedTotalMinor: number;
  depositPaidMinor: number;
  balancePaidMinor: number;
}) {
  const payableTotal = finalTotalMinor ?? estimatedTotalMinor;

  return Math.max(payableTotal - depositPaidMinor - balancePaidMinor, 0);
}

export function getPaymentDisplayStatus(booking: BookingBalanceSnapshot): PaymentDisplayStatus {
  if (booking.depositPaidMinor <= 0 && booking.balancePaidMinor <= 0) {
    return "deposit_pending";
  }

  if (booking.balanceDueMinor <= 0) {
    return "fully_paid";
  }

  if (booking.balancePaidMinor > 0) {
    return "partially_paid";
  }

  return booking.depositPaidMinor > 0 ? "balance_unpaid" : "deposit_pending";
}

export function validateMarkBalancePaidInput(
  input: MarkBalancePaidInput,
  booking?: BookingBalanceSnapshot,
) {
  const errors: string[] = [];

  if (!input.bookingId.trim()) errors.push("Booking id is required.");
  if (!input.adminId.trim()) errors.push("Admin id is required.");
  if (!Number.isInteger(input.amountPaidMinor) || input.amountPaidMinor <= 0) {
    errors.push("Balance payment amount must be greater than zero.");
  }
  if (!isBalancePaymentMethod(input.paymentMethod)) {
    errors.push("Payment method is invalid.");
  }
  if (input.paidAt && Number.isNaN(Date.parse(input.paidAt))) {
    errors.push("Paid at must be a valid date-time value.");
  }

  if (booking) {
    if (!canRecordBalancePaymentForStatus(booking.status)) {
      errors.push("Balance can only be recorded for active or completed bookings.");
    }
    if (booking.balanceDueMinor <= 0) {
      errors.push("There is no remaining balance to record.");
    }
    if (input.amountPaidMinor > booking.balanceDueMinor) {
      errors.push("Balance payment cannot exceed the remaining balance.");
    }
  }

  return errors;
}

export async function markBalancePaid(
  input: MarkBalancePaidInput,
  options: MarkBalancePaidOptions = {},
): Promise<MarkBalancePaidResult> {
  const validationErrors = validateMarkBalancePaidInput(input, options.booking);

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "BALANCE_PAYMENT_VALIDATION_FAILED",
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

  if (!options.canMarkBalancePaid) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot record balance payments.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  const nextBalancePaidMinor = options.booking.balancePaidMinor + input.amountPaidMinor;
  const nextBalanceDueMinor = calculateBalanceDueMinor({
    finalTotalMinor: options.booking.finalTotalMinor,
    estimatedTotalMinor: options.booking.estimatedTotalMinor,
    depositPaidMinor: options.booking.depositPaidMinor,
    balancePaidMinor: nextBalancePaidMinor,
  });
  const paymentStatus = getPaymentDisplayStatus({
    ...options.booking,
    balancePaidMinor: nextBalancePaidMinor,
    balanceDueMinor: nextBalanceDueMinor,
  });

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "BALANCE_PAYMENT_PERSISTENCE_NOT_CONFIGURED",
      message: "Balance payment recording is not connected to database persistence yet.",
    };
  }

  // TODO: Create a balance payment row, update booking balance fields, and write an audit log in one transaction.
  return {
    success: true,
    balancePaidMinor: nextBalancePaidMinor,
    balanceDueMinor: nextBalanceDueMinor,
    paymentStatus,
  };
}
