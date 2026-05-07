import type { BookingStatus } from "./types";

export const adminBookingStatusLabels: Record<BookingStatus, string> = {
  draft: "Draft",
  zone_validated: "Location checked",
  payment_hold: "Payment in progress",
  pending_admin_review: "Needs review",
  approved: "Approved",
  declined: "Declined",
  reschedule_requested: "Reschedule sent",
  on_the_way: "On the way",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  cancelled_by_customer: "Customer cancelled",
  cancelled_by_admin: "Cancelled by AUTO VALET",
  no_show: "No-show recorded",
  expired: "Expired",
  payment_failed: "Payment failed",
  refunded: "Refunded",
};

export const customerBookingStatusLabels: Record<BookingStatus, string> = {
  draft: "Draft",
  zone_validated: "Location checked",
  payment_hold: "Deposit payment in progress",
  pending_admin_review: "Waiting for approval",
  approved: "Confirmed",
  declined: "Declined",
  reschedule_requested: "New time suggested",
  on_the_way: "On the way",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  cancelled_by_customer: "Cancelled",
  cancelled_by_admin: "Cancelled by AUTO VALET",
  no_show: "No-show recorded",
  expired: "Expired",
  payment_failed: "Payment failed",
  refunded: "Refunded",
};

export function getAdminBookingStatusLabel(status: BookingStatus) {
  return adminBookingStatusLabels[status];
}

export function getCustomerBookingStatusLabel(status: BookingStatus) {
  return customerBookingStatusLabels[status];
}
