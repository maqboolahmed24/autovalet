import { getDefaultWorkingHoursRules } from "./default-availability";
import { getBlockedTimeOverrides, getCustomHoursOverrides, hasClosedDayOverride } from "./overrides";
import type { DayAvailability, GetWorkingHoursForDateInput, TimeWindow, Weekday, WorkingHoursRule } from "./types";

function assertDateString(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date string: ${date}`);
  }
}

function sortByStartTime<TWindow extends TimeWindow>(windows: TWindow[]) {
  return [...windows].sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
}

export function getWeekdayFromDate(date: string): Weekday {
  assertDateString(date);

  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return weekday as Weekday;
}

export function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time string: ${time}`);
  }

  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number) {
  if (!Number.isInteger(totalMinutes) || totalMinutes < 0 || totalMinutes > 24 * 60) {
    throw new Error(`Invalid minute value: ${totalMinutes}`);
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutes: number) {
  if (!Number.isInteger(minutes)) {
    throw new Error(`Invalid minute offset: ${minutes}`);
  }

  return formatMinutesToTime(parseTimeToMinutes(time) + minutes);
}

export function getWorkingHoursForDate({
  date,
  rules = getDefaultWorkingHoursRules(),
  overrides = [],
}: GetWorkingHoursForDateInput): DayAvailability {
  assertDateString(date);

  if (hasClosedDayOverride(date, overrides)) {
    return {
      date,
      isClosed: true,
      workingWindows: [],
      blockedWindows: [],
    };
  }

  const customHours = getCustomHoursOverrides(date, overrides);
  const workingWindows =
    customHours.length > 0
      ? customHours
      : rulesToWindowsForWeekday(rules, getWeekdayFromDate(date));
  const sortedWorkingWindows = sortByStartTime(workingWindows).filter(
    (window) => parseTimeToMinutes(window.endTime) > parseTimeToMinutes(window.startTime),
  );

  return {
    date,
    isClosed: sortedWorkingWindows.length === 0,
    workingWindows: sortedWorkingWindows,
    blockedWindows: sortByStartTime(getBlockedTimeOverrides(date, overrides)).filter(
      (window) => parseTimeToMinutes(window.endTime) > parseTimeToMinutes(window.startTime),
    ),
  };
}

export function isTimeWithinWorkingHours(
  date: string,
  startTime: string,
  endTime: string,
  dayAvailability: DayAvailability,
) {
  assertDateString(date);

  if (dayAvailability.date !== date || dayAvailability.isClosed) {
    return false;
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    return false;
  }

  return dayAvailability.workingWindows.some((window) => {
    const windowStart = parseTimeToMinutes(window.startTime);
    const windowEnd = parseTimeToMinutes(window.endTime);

    return startMinutes >= windowStart && endMinutes <= windowEnd;
  });
}

export function doesServiceFitInsideWorkingHours(
  serviceStart: string,
  serviceEnd: string,
  dayAvailability: DayAvailability,
) {
  return isTimeWithinWorkingHours(dayAvailability.date, serviceStart, serviceEnd, dayAvailability);
}

function rulesToWindowsForWeekday(rules: WorkingHoursRule[], weekday: Weekday): TimeWindow[] {
  return rules
    .filter((rule) => rule.active && rule.weekday === weekday)
    .map((rule) => ({
      startTime: rule.startTime,
      endTime: rule.endTime,
    }));
}
