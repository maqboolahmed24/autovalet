export type BookingEventType =
  | "booking_draft_created"
  | "zone_validated"
  | "payment_hold_created"
  | "payment_hold_expired"
  | "deposit_paid"
  | "booking_request_received"
  | "booking_approved"
  | "booking_declined"
  | "reschedule_requested"
  | "customer_cancelled"
  | "admin_cancelled"
  | "job_started"
  | "job_completed"
  | "no_show_recorded"
  | "refund_recorded"
  | "balance_paid";

export const bookingEventTypes = [
  "booking_draft_created",
  "zone_validated",
  "payment_hold_created",
  "payment_hold_expired",
  "deposit_paid",
  "booking_request_received",
  "booking_approved",
  "booking_declined",
  "reschedule_requested",
  "customer_cancelled",
  "admin_cancelled",
  "job_started",
  "job_completed",
  "no_show_recorded",
  "refund_recorded",
  "balance_paid",
] as const satisfies readonly BookingEventType[];
