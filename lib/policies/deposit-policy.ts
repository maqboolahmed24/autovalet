import type { DepositAction } from "./types";

export const depositActionLabels: Record<DepositAction, string> = {
  refund: "Refund deposit",
  transfer: "Transfer deposit",
  keep_according_to_policy: "Keep according to policy",
  no_deposit_action_required: "No deposit action required",
};

export const depositActionDescriptions: Record<DepositAction, string> = {
  refund: "Return the deposit through the original payment route when provider and persistence are configured.",
  transfer: "Hold the deposit against a future booking or rescheduled appointment.",
  keep_according_to_policy: "Record that the deposit is kept under the published cancellation policy.",
  no_deposit_action_required: "No deposit was paid or no financial action is needed.",
};

export function isDepositAction(value: unknown): value is DepositAction {
  return (
    value === "refund" ||
    value === "transfer" ||
    value === "keep_according_to_policy" ||
    value === "no_deposit_action_required"
  );
}

export function getDepositActionLabel(action: DepositAction) {
  return depositActionLabels[action];
}

export function getDepositPolicySummary() {
  return [
    "If AUTO VALET declines before approval, the deposit can be refunded or transferred.",
    "If AUTO VALET cancels due to weather or operational issues, the deposit can be refunded or transferred.",
    "Customer cancellations more than 48 hours before an approved appointment may transfer the deposit once.",
    "Customer cancellations within 48 hours and no-show/access failures may forfeit the deposit.",
  ];
}

export function getDepositActionForUnpaidBooking(depositPaidMinor: number): DepositAction | null {
  return depositPaidMinor <= 0 ? "no_deposit_action_required" : null;
}
