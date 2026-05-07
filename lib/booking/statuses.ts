import type { BookingSource, BookingStatus, PaymentStatus, ZoneStatus } from "./types";
export {
  adminBookingStatusLabels,
  customerBookingStatusLabels,
  getAdminBookingStatusLabel,
  getCustomerBookingStatusLabel,
} from "./status-labels";

export const bookingStatuses = [
  "draft",
  "zone_validated",
  "payment_hold",
  "pending_admin_review",
  "approved",
  "declined",
  "reschedule_requested",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
  "cancelled_by_customer",
  "cancelled_by_admin",
  "no_show",
  "expired",
  "payment_failed",
  "refunded",
] as const satisfies readonly BookingStatus[];

export const calendarBlockingStatuses = [
  "payment_hold",
  "pending_admin_review",
  "approved",
  "on_the_way",
  "arrived",
  "in_progress",
] as const satisfies readonly BookingStatus[];

export const blockingBookingStatuses = calendarBlockingStatuses;

export const calendarNonBlockingStatuses = [
  "declined",
  "reschedule_requested",
  "completed",
  "cancelled_by_customer",
  "cancelled_by_admin",
  "no_show",
  "expired",
  "payment_failed",
  "refunded",
] as const satisfies readonly BookingStatus[];

export const nonBlockingBookingStatuses = calendarNonBlockingStatuses;

export const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
  "transferred",
] as const satisfies readonly PaymentStatus[];

export const zoneStatuses = [
  "standard_zone",
  "outside_zone_volume_exception",
  "outside_service_area",
] as const satisfies readonly ZoneStatus[];

export const bookingSources = [
  "public_booking",
  "admin_manual",
  "phone",
  "instagram",
  "whatsapp",
  "referral",
] as const satisfies readonly BookingSource[];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
  transferred: "Transferred",
};

export const zoneStatusLabels: Record<ZoneStatus, string> = {
  standard_zone: "Standard service zone",
  outside_zone_volume_exception: "Outside-zone volume exception",
  outside_service_area: "Outside service area",
};

export function isCalendarBlockingStatus(status: BookingStatus | string) {
  return (calendarBlockingStatuses as readonly string[]).includes(status);
}

export function isBlockingBookingStatus(status: BookingStatus) {
  return isCalendarBlockingStatus(status);
}
