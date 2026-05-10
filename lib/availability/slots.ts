import { travelBufferMinutes as defaultTravelBufferMinutes } from "../pricing/calculate-duration";
import { BUSINESS_TIMEZONE } from "./default-availability";
import { hasMinuteOverlap, hasOverlap, isCalendarBlockingStatus } from "./conflicts";
import type { AvailabilityOverride, WorkingHoursRule } from "./types";
import {
  addMinutesToTime,
  getWorkingHoursForDate,
  isValidDateString,
  isValidTimeString,
  parseTimeToMinutes,
} from "./working-hours";

export const slotIncrementMinutes = 15;
export const extendedRequestStartWindowMinutes = 120;

export type CalendarBlockingBooking = {
  id: string;
  status: string;
  requestedStartAt: string;
  blockedUntil: string;
};

export type AvailableSlot = {
  start: string;
  label: string;
  serviceEndsAt: string;
  blockedUntil: string;
  serviceDurationMinutes: number;
  travelBufferMinutes: number;
  isExtendedRequest: boolean;
};

export type GenerateSlotsInput = {
  date: string;
  serviceDurationMinutes: number;
  travelBufferMinutes?: number;
  workingHoursRules?: WorkingHoursRule[];
  overrides?: AvailabilityOverride[];
  existingBookings?: CalendarBlockingBooking[];
  allowExtendedServiceRequest?: boolean;
  extendedRequestStartWindowMinutes?: number;
};

function getLocalPartsInTimezone(date: Date, timeZone = BUSINESS_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const getPart = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
}

function getTimezoneOffsetMinutes(date: Date, timeZone = BUSINESS_TIMEZONE) {
  const localParts = getLocalPartsInTimezone(date, timeZone);
  const localAsUtc = Date.UTC(
    localParts.year,
    localParts.month - 1,
    localParts.day,
    localParts.hour,
    localParts.minute,
    localParts.second,
  );

  return (localAsUtc - date.getTime()) / 60_000;
}

export function createUtcDateFromBusinessTime(date: string, time: string) {
  if (!isValidDateString(date) || !isValidTimeString(time)) {
    throw new Error(`Invalid business date/time: ${date} ${time}`);
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  const offsetMinutes = getTimezoneOffsetMinutes(utcGuess);

  return new Date(utcGuess.getTime() - offsetMinutes * 60_000);
}

function addDaysToDateString(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));

  return result.toISOString().slice(0, 10);
}

function getBusinessDateTimeFromMinutes(date: string, minutesFromMidnight: number) {
  const dayOffset = Math.floor(minutesFromMidnight / (24 * 60));
  const minutesInDay = minutesFromMidnight % (24 * 60);

  return {
    date: addDaysToDateString(date, dayOffset),
    time: addMinutesToTime("00:00", minutesInDay),
  };
}

function createUtcDateFromBusinessMinutes(date: string, minutesFromMidnight: number) {
  const businessDateTime = getBusinessDateTimeFromMinutes(date, minutesFromMidnight);

  return createUtcDateFromBusinessTime(businessDateTime.date, businessDateTime.time);
}

function candidateOverlapsBlockedWindow(
  candidateStartMinutes: number,
  candidateBlockedUntilMinutes: number,
  blockedWindows: ReturnType<typeof getWorkingHoursForDate>["blockedWindows"],
) {
  return blockedWindows.some((blockedWindow) =>
    hasMinuteOverlap(
      candidateStartMinutes,
      candidateBlockedUntilMinutes,
      parseTimeToMinutes(blockedWindow.startTime),
      parseTimeToMinutes(blockedWindow.endTime),
    ),
  );
}

function candidateOverlapsExistingBooking(
  candidateStart: Date,
  candidateBlockedUntil: Date,
  existingBookings: CalendarBlockingBooking[],
) {
  return existingBookings.some((booking) => {
    if (!isCalendarBlockingStatus(booking.status)) {
      return false;
    }

    const existingStart = new Date(booking.requestedStartAt);
    const existingBlockedUntil = new Date(booking.blockedUntil);

    if (Number.isNaN(existingStart.getTime()) || Number.isNaN(existingBlockedUntil.getTime())) {
      return false;
    }

    return hasOverlap(candidateStart, candidateBlockedUntil, existingStart, existingBlockedUntil);
  });
}

function getLatestCandidateStartMinutes({
  windowStartMinutes,
  windowEndMinutes,
  serviceDurationMinutes,
  allowExtendedServiceRequest,
  extendedStartWindowMinutes,
}: {
  windowStartMinutes: number;
  windowEndMinutes: number;
  serviceDurationMinutes: number;
  allowExtendedServiceRequest: boolean;
  extendedStartWindowMinutes: number;
}) {
  const strictLatestStartMinutes = windowEndMinutes - serviceDurationMinutes;

  if (strictLatestStartMinutes >= windowStartMinutes) {
    return strictLatestStartMinutes;
  }

  if (!allowExtendedServiceRequest || serviceDurationMinutes <= windowEndMinutes - windowStartMinutes) {
    return null;
  }

  return Math.min(
    windowEndMinutes - slotIncrementMinutes,
    windowStartMinutes + Math.max(0, extendedStartWindowMinutes),
  );
}

export function generateAvailableSlots({
  date,
  serviceDurationMinutes,
  travelBufferMinutes = defaultTravelBufferMinutes,
  workingHoursRules,
  overrides = [],
  existingBookings = [],
  allowExtendedServiceRequest = false,
  extendedRequestStartWindowMinutes: inputExtendedRequestStartWindowMinutes = extendedRequestStartWindowMinutes,
}: GenerateSlotsInput): AvailableSlot[] {
  if (serviceDurationMinutes <= 0) {
    return [];
  }

  const dayAvailability = getWorkingHoursForDate({
    date,
    rules: workingHoursRules,
    overrides,
  });

  if (dayAvailability.isClosed) {
    return [];
  }

  const slots: AvailableSlot[] = [];

  for (const workingWindow of dayAvailability.workingWindows) {
    const windowStartMinutes = parseTimeToMinutes(workingWindow.startTime);
    const windowEndMinutes = parseTimeToMinutes(workingWindow.endTime);
    const latestCandidateStartMinutes = getLatestCandidateStartMinutes({
      windowStartMinutes,
      windowEndMinutes,
      serviceDurationMinutes,
      allowExtendedServiceRequest,
      extendedStartWindowMinutes: inputExtendedRequestStartWindowMinutes,
    });

    if (latestCandidateStartMinutes === null) {
      continue;
    }

    for (
      let candidateStartMinutes = windowStartMinutes;
      candidateStartMinutes <= latestCandidateStartMinutes;
      candidateStartMinutes += slotIncrementMinutes
    ) {
      const label = addMinutesToTime("00:00", candidateStartMinutes);
      const serviceEndMinutes = candidateStartMinutes + serviceDurationMinutes;
      const blockedUntilMinutes = serviceEndMinutes + travelBufferMinutes;
      const isExtendedRequest = serviceEndMinutes > windowEndMinutes;

      if (
        candidateOverlapsBlockedWindow(
          candidateStartMinutes,
          blockedUntilMinutes,
          dayAvailability.blockedWindows,
        )
      ) {
        continue;
      }

      const candidateStart = createUtcDateFromBusinessMinutes(date, candidateStartMinutes);
      const candidateBlockedUntil = createUtcDateFromBusinessMinutes(date, blockedUntilMinutes);

      if (candidateOverlapsExistingBooking(candidateStart, candidateBlockedUntil, existingBookings)) {
        continue;
      }

      slots.push({
        start: candidateStart.toISOString(),
        label,
        serviceEndsAt: createUtcDateFromBusinessMinutes(date, serviceEndMinutes).toISOString(),
        blockedUntil: candidateBlockedUntil.toISOString(),
        serviceDurationMinutes,
        travelBufferMinutes,
        isExtendedRequest,
      });
    }
  }

  return slots;
}
