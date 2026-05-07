import type { BookingStatus } from "../booking/types";
import {
  calendarBlockingStatuses,
  calendarNonBlockingStatuses,
  isCalendarBlockingStatus as isBlockingBookingStatus,
} from "../booking/statuses";

export { calendarBlockingStatuses, calendarNonBlockingStatuses };

export function isCalendarBlockingStatus(status: string) {
  return isBlockingBookingStatus(status as BookingStatus);
}

export function hasOverlap(
  newStart: Date,
  newBlockedUntil: Date,
  existingStart: Date,
  existingBlockedUntil: Date,
) {
  return newStart < existingBlockedUntil && newBlockedUntil > existingStart;
}

export function hasMinuteOverlap(
  newStartMinutes: number,
  newEndMinutes: number,
  existingStartMinutes: number,
  existingEndMinutes: number,
) {
  return newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;
}
