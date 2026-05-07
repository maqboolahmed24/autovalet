import type { PaymentDisplayStatus } from "../../lib/payments/balance";

type PaymentStatusBadgeProps = {
  status: PaymentDisplayStatus;
};

const paymentStatusLabels: Record<PaymentDisplayStatus, string> = {
  no_payment_required: "No payment required",
  deposit_pending: "Deposit pending",
  deposit_paid: "Deposit paid",
  balance_unpaid: "Balance due",
  partially_paid: "Partially paid",
  fully_paid: "Fully paid",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
  transferred: "Transferred",
  payment_failed: "Payment failed",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={`payment-status-badge payment-status-badge--${status}`}>
      {paymentStatusLabels[status]}
    </span>
  );
}
