export type TransferDepositInput = {
  fromBookingId: string;
  toBookingId?: string;
  futureBookingReference?: string;
  adminId: string;
  amountMinor: number;
  reason: string;
};

export type TransferDepositResult =
  | {
      success: true;
      transferReference: string;
      amountMinor: number;
      status: "recorded" | "pending_future_booking";
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type TransferDepositOptions = {
  adminAuthenticated?: boolean;
  canTransferDeposit?: boolean;
  persistenceConfigured?: boolean;
};

export function validateTransferDepositInput(input: TransferDepositInput) {
  const errors: string[] = [];

  if (!input.fromBookingId.trim()) errors.push("Source booking id is required.");
  if (!input.adminId.trim()) errors.push("Admin id is required.");
  if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
    errors.push("Transfer amount must be greater than zero.");
  }
  if (input.reason.trim().length < 5) {
    errors.push("Transfer reason must be at least 5 characters.");
  }

  return errors;
}

export async function transferDeposit(
  input: TransferDepositInput,
  options: TransferDepositOptions = {},
): Promise<TransferDepositResult> {
  const validationErrors = validateTransferDepositInput(input);

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "TRANSFER_VALIDATION_FAILED",
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

  if (!options.canTransferDeposit) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot transfer deposits.",
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "TRANSFER_PERSISTENCE_NOT_CONFIGURED",
      message: "Deposit transfer persistence is not connected yet.",
    };
  }

  // TODO: Record a transfer payment row, link the future booking when present, and write an audit log.
  // TODO: Dispatch `deposit_transferred` after persistence succeeds.
  return {
    success: true,
    transferReference: `TR-${input.fromBookingId}`,
    amountMinor: input.amountMinor,
    status: input.toBookingId ? "recorded" : "pending_future_booking",
  };
}
