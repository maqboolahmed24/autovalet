export type RefundDepositInput = {
  bookingId: string;
  paymentId?: string;
  amountMinor: number;
  reason: string;
  adminId: string;
};

export type RefundDepositResult =
  | {
      success: true;
      refundReference: string;
      amountMinor: number;
      status: "completed" | "pending";
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type RefundDepositOptions = {
  adminAuthenticated?: boolean;
  canRefundPayment?: boolean;
  paymentProviderConfigured?: boolean;
  persistenceConfigured?: boolean;
};

export function validateRefundDepositInput(input: RefundDepositInput) {
  const errors: string[] = [];

  if (!input.bookingId.trim()) errors.push("Booking id is required.");
  if (!input.adminId.trim()) errors.push("Admin id is required.");
  if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
    errors.push("Refund amount must be greater than zero.");
  }
  if (input.reason.trim().length < 5) {
    errors.push("Refund reason must be at least 5 characters.");
  }

  return errors;
}

export async function refundDeposit(
  input: RefundDepositInput,
  options: RefundDepositOptions = {},
): Promise<RefundDepositResult> {
  const validationErrors = validateRefundDepositInput(input);

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "REFUND_VALIDATION_FAILED",
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

  if (!options.canRefundPayment) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot refund deposits.",
    };
  }

  if (!options.paymentProviderConfigured) {
    return {
      success: false,
      code: "REFUND_PROVIDER_NOT_CONFIGURED",
      message: "Refund provider access is not configured yet.",
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "REFUND_PERSISTENCE_NOT_CONFIGURED",
      message: "Refund persistence is not connected yet.",
    };
  }

  // TODO: Execute provider refund, store refund payment row, write audit log,
  // then dispatch `deposit_refunded` without exposing provider internals to the customer.
  return {
    success: false,
    code: "REFUND_PROVIDER_ADAPTER_NOT_IMPLEMENTED",
    message: "Refund provider execution is not implemented yet.",
  };
}
