import { getDefaultWorkingHoursRules } from "../availability/default-availability";
import type { AvailabilityOverride, AvailabilityOverrideType, Weekday } from "../availability/types";
import { parseTimeToMinutes } from "../availability/working-hours";

export type AdminAvailabilityData = {
  isMockData: boolean;
  workingHours: {
    weekday: Weekday;
    weekdayLabel: string;
    active: boolean;
    startTime?: string;
    endTime?: string;
  }[];
  upcomingOverrides: {
    id: string;
    dateLabel: string;
    typeLabel: string;
    timeLabel: string;
    reason?: string;
  }[];
};

export type AddBlockedTimeInput = {
  date: string;
  type: "closed_day" | "blocked_time";
  startTime?: string;
  endTime?: string;
  reason: string;
};

export type AddBlockedTimeResult =
  | {
      success: true;
      overrideId: string;
      type: AvailabilityOverrideType;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type UpdateWorkingHoursInput = {
  weekday: Weekday;
  active: boolean;
  startTime?: string;
  endTime?: string;
};

export type UpdateWorkingHoursResult =
  | {
      success: true;
      weekday: Weekday;
      active: boolean;
      startTime?: string;
      endTime?: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type AdminAvailabilityMutationOptions = {
  adminAuthenticated?: boolean;
  canEditAvailability?: boolean;
  persistenceConfigured?: boolean;
};

type AdminAvailabilityFailure = {
  success: false;
  code: string;
  message: string;
};

const weekdayLabels: Record<Weekday, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const blockedTimeReasonSuggestions = [
  "Van maintenance",
  "Personal appointment",
  "Weather",
  "Holiday",
  "Fully booked",
  "Other",
] as const;

export async function getAdminAvailabilitySettings(): Promise<AdminAvailabilityData> {
  // TODO: Replace default rules and mock overrides with admin-managed database records.
  const workingHours = getDefaultWorkingHoursRules()
    .sort((a, b) => normalizeWeekdaySort(a.weekday) - normalizeWeekdaySort(b.weekday))
    .map((rule) => ({
      weekday: rule.weekday,
      weekdayLabel: weekdayLabels[rule.weekday],
      active: rule.active,
      startTime: rule.active ? rule.startTime : undefined,
      endTime: rule.active ? rule.endTime : undefined,
    }));

  return {
    isMockData: true,
    workingHours,
    upcomingOverrides: getMockUpcomingOverrides().map(formatAvailabilityOverride),
  };
}

export async function addBlockedTime(
  input: AddBlockedTimeInput,
  options: AdminAvailabilityMutationOptions = {},
): Promise<AddBlockedTimeResult> {
  const guard = validateAvailabilityMutationOptions(options);

  if (guard) {
    return guard;
  }

  const validation = validateAddBlockedTimeInput(input);

  if (validation) {
    return validation;
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "AVAILABILITY_PERSISTENCE_NOT_CONFIGURED",
      message: "Availability persistence is not configured yet.",
    };
  }

  // TODO: Insert availability override, check calendar conflicts, and write audit log.
  return {
    success: true,
    overrideId: "pending-db-override",
    type: input.type,
  };
}

export async function updateWorkingHours(
  input: UpdateWorkingHoursInput,
  options: AdminAvailabilityMutationOptions = {},
): Promise<UpdateWorkingHoursResult> {
  const guard = validateAvailabilityMutationOptions(options);

  if (guard) {
    return guard;
  }

  const validation = validateUpdateWorkingHoursInput(input);

  if (validation) {
    return validation;
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "AVAILABILITY_PERSISTENCE_NOT_CONFIGURED",
      message: "Availability persistence is not configured yet.",
    };
  }

  // TODO: Update weekly working-hours rule, check affected bookings, and write audit log.
  return {
    success: true,
    weekday: input.weekday,
    active: input.active,
    startTime: input.active ? input.startTime : undefined,
    endTime: input.active ? input.endTime : undefined,
  };
}

export function isBlockedTimeInputType(value: unknown): value is AddBlockedTimeInput["type"] {
  return value === "closed_day" || value === "blocked_time";
}

export function isWeekday(value: unknown): value is Weekday {
  return Number.isInteger(value) && typeof value === "number" && value >= 0 && value <= 6;
}

export function getWeekdayLabel(weekday: Weekday) {
  return weekdayLabels[weekday];
}

function validateAvailabilityMutationOptions(
  options: AdminAvailabilityMutationOptions,
): AdminAvailabilityFailure | null {
  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_REQUIRED",
      message: "Admin sign-in is required.",
    };
  }

  if (!options.canEditAvailability) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account does not have permission to edit availability.",
    };
  }

  return null;
}

function validateAddBlockedTimeInput(input: AddBlockedTimeInput): AddBlockedTimeResult | null {
  if (!isDateString(input.date)) {
    return {
      success: false,
      code: "INVALID_BLOCKED_TIME_DATE",
      message: "Choose a valid date.",
    };
  }

  if (!input.reason.trim()) {
    return {
      success: false,
      code: "BLOCKED_TIME_REASON_REQUIRED",
      message: "Add a reason for the blocked time.",
    };
  }

  if (input.type === "closed_day") {
    return null;
  }

  if (!input.startTime || !input.endTime) {
    return {
      success: false,
      code: "BLOCKED_TIME_RANGE_REQUIRED",
      message: "Choose a start and end time for a time range block.",
    };
  }

  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return {
      success: false,
      code: "INVALID_BLOCKED_TIME_RANGE",
      message: "Blocked time must end after it starts.",
    };
  }

  return null;
}

function validateUpdateWorkingHoursInput(input: UpdateWorkingHoursInput): UpdateWorkingHoursResult | null {
  if (!isWeekday(input.weekday)) {
    return {
      success: false,
      code: "INVALID_WEEKDAY",
      message: "Choose a valid weekday.",
    };
  }

  if (!input.active) {
    return null;
  }

  if (!input.startTime || !input.endTime) {
    return {
      success: false,
      code: "WORKING_HOURS_RANGE_REQUIRED",
      message: "Choose a start and end time for active working hours.",
    };
  }

  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return {
      success: false,
      code: "INVALID_WORKING_HOURS_RANGE",
      message: "Working hours must end after they start.",
    };
  }

  return null;
}

function isValidTimeRange(startTime: string, endTime: string) {
  try {
    return parseTimeToMinutes(endTime) > parseTimeToMinutes(startTime);
  } catch {
    return false;
  }
}

function isDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeWeekdaySort(weekday: Weekday) {
  return weekday === 0 ? 7 : weekday;
}

function formatAvailabilityOverride(override: AvailabilityOverride): AdminAvailabilityData["upcomingOverrides"][number] {
  return {
    id: override.id,
    dateLabel: formatDateLabel(override.date),
    typeLabel: override.type === "closed_day" ? "Closed day" : "Blocked time",
    timeLabel: override.type === "closed_day" ? "Full day" : `${override.startTime} - ${override.endTime}`,
    reason: override.reason,
  };
}

function getMockUpcomingOverrides(): AvailabilityOverride[] {
  const today = getTodayInBusinessTimezone();

  return [
    {
      id: "mock-closed-weather",
      date: addDays(today, 4),
      type: "closed_day",
      reason: "Weather watch",
    },
    {
      id: "mock-blocked-van",
      date: addDays(today, 7),
      type: "blocked_time",
      startTime: "12:00",
      endTime: "14:00",
      reason: "Van maintenance",
    },
    {
      id: "mock-closed-holiday",
      date: addDays(today, 11),
      type: "closed_day",
      reason: "Holiday",
    },
  ];
}

function getTodayInBusinessTimezone() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));

  return result.toISOString().slice(0, 10);
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)));
}
