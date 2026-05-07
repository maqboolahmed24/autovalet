import { paymentStatuses } from "../../booking/statuses";

export const paymentsTable = {
  name: "payments",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    bookingId: { name: "booking_id", type: "uuid", references: "bookings.id", nullable: false },
    gateway: { type: "text", nullable: false },
    gatewayPaymentId: { name: "gateway_payment_id", type: "text", nullable: true },
    gatewayCheckoutSessionId: { name: "gateway_checkout_session_id", type: "text", nullable: true },
    idempotencyKey: { name: "idempotency_key", type: "text", nullable: true, unique: true },
    amountMinor: { name: "amount_minor", type: "integer", nullable: false },
    currency: { type: "text", nullable: false, default: "GBP" },
    status: { type: "text", nullable: false, enumValues: paymentStatuses },
    paymentType: { name: "payment_type", type: "text", nullable: false },
    paidAt: { name: "paid_at", type: "timestamptz", nullable: true },
    refundedAt: { name: "refunded_at", type: "timestamptz", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "payments_booking_id_idx", columns: ["booking_id"] },
    { name: "payments_gateway_payment_id_idx", columns: ["gateway_payment_id"] },
    { name: "payments_idempotency_key_idx", columns: ["idempotency_key"], unique: true },
  ],
  checks: [
    "amount_minor >= 0",
    "currency = 'GBP'",
    "payment_type in ('deposit', 'balance', 'refund', 'transfer')",
  ],
} as const;
