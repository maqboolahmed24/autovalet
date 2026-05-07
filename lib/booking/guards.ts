import type { BookingStatus } from "./types";
import { calendarBlockingStatuses } from "./statuses";

export function isCalendarBlockingStatus(status: BookingStatus) {
  return (calendarBlockingStatuses as readonly BookingStatus[]).includes(status);
}

export function canApproveBooking(status: BookingStatus) {
  return status === "pending_admin_review";
}

export function canDeclineBooking(status: BookingStatus) {
  return status === "pending_admin_review";
}

export function canExpirePaymentHold(status: BookingStatus) {
  return status === "payment_hold";
}

export function canMarkDepositPaid(status: BookingStatus) {
  return status === "payment_hold";
}
