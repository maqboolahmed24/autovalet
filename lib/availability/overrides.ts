import type { AvailabilityOverride, BlockedTimeWindow, TimeWindow } from "./types";

export function getOverridesForDate(date: string, overrides: AvailabilityOverride[] = []) {
  return overrides.filter((override) => override.date === date);
}

export function hasClosedDayOverride(date: string, overrides: AvailabilityOverride[] = []) {
  return getOverridesForDate(date, overrides).some((override) => override.type === "closed_day");
}

export function getCustomHoursOverrides(date: string, overrides: AvailabilityOverride[] = []): TimeWindow[] {
  return getOverridesForDate(date, overrides)
    .filter((override) => override.type === "custom_hours" && override.startTime && override.endTime)
    .map((override) => ({
      startTime: override.startTime as string,
      endTime: override.endTime as string,
    }));
}

export function getBlockedTimeOverrides(date: string, overrides: AvailabilityOverride[] = []): BlockedTimeWindow[] {
  return getOverridesForDate(date, overrides)
    .filter((override) => override.type === "blocked_time" && override.startTime && override.endTime)
    .map((override) => ({
      startTime: override.startTime as string,
      endTime: override.endTime as string,
      reason: override.reason,
    }));
}
