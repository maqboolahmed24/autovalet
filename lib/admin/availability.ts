import { randomUUID } from "node:crypto";
import { getDefaultWorkingHoursRules } from "../availability/default-availability";
import type { AvailabilityOverride, AvailabilityOverrideType, Weekday, WorkingHoursRule } from "../availability/types";
import {
  getBusinessDateString,
  isValidDateString,
  parseTimeToMinutes,
} from "../availability/working-hours";
import { isDatabaseConfigured, query, transaction } from "../db/postgres";

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

type AvailabilityRuleRow = {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  active: boolean;
};

type AvailabilityOverrideRow = {
  id: string;
  date: Date | string;
  start_time: string | null;
  end_time: string | null;
  type: string;
  reason: string | null;
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

async function seedDefaultAvailabilityIfEmpty() {
  await transaction(async (client) => {
    const countResult = await client.query<{ count: string }>("SELECT count(*) FROM availability_rules");
    const shouldSeed = Number(countResult.rows[0]?.count ?? 0) === 0;

    if (!shouldSeed) return;

    for (const rule of getDefaultWorkingHoursRules()) {
      await client.query(
        `
          INSERT INTO availability_rules (id, weekday, start_time, end_time, active)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (weekday)
          DO UPDATE SET
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            active = EXCLUDED.active,
            updated_at = now()
        `,
        [randomUUID(), rule.weekday, rule.startTime, rule.endTime, rule.active],
      );
    }
  });
}

function toWeekday(value: number): Weekday {
  return isWeekday(value) ? value : 0;
}

function toDateString(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function toAvailabilityOverrideType(value: string): AvailabilityOverrideType {
  if (value === "closed_day" || value === "custom_hours" || value === "blocked_time") {
    return value;
  }

  return "blocked_time";
}

function mapRuleRow(row: AvailabilityRuleRow): WorkingHoursRule {
  return {
    id: row.id,
    weekday: toWeekday(row.weekday),
    startTime: row.start_time,
    endTime: row.end_time,
    active: row.active,
  };
}

function mapOverrideRow(row: AvailabilityOverrideRow): AvailabilityOverride {
  const override: AvailabilityOverride = {
    id: row.id,
    date: toDateString(row.date),
    type: toAvailabilityOverrideType(row.type),
    reason: row.reason ?? undefined,
  };

  if (row.start_time) override.startTime = row.start_time;
  if (row.end_time) override.endTime = row.end_time;

  return override;
}

export async function getAvailabilityPersistence(): Promise<{
  rules: WorkingHoursRule[];
  overrides: AvailabilityOverride[];
  isDatabaseBacked: boolean;
}> {
  if (!isDatabaseConfigured()) {
    return {
      rules: getDefaultWorkingHoursRules(),
      overrides: [],
      isDatabaseBacked: false,
    };
  }

  await seedDefaultAvailabilityIfEmpty();

  const [rulesResult, overridesResult] = await Promise.all([
    query<AvailabilityRuleRow>(
      `
        SELECT id, weekday, start_time, end_time, active
        FROM availability_rules
        ORDER BY weekday ASC
      `,
    ),
    query<AvailabilityOverrideRow>(
      `
        SELECT id, date, start_time, end_time, type, reason
        FROM availability_overrides
        WHERE date >= (now() AT TIME ZONE 'Europe/London')::date
        ORDER BY date ASC, start_time ASC NULLS FIRST, created_at ASC
      `,
    ),
  ]);

  return {
    rules: rulesResult.rows.map(mapRuleRow),
    overrides: overridesResult.rows.map(mapOverrideRow),
    isDatabaseBacked: true,
  };
}

function getOverrideTypeLabel(type: AvailabilityOverrideType) {
  if (type === "closed_day") return "Closed day";
  if (type === "custom_hours") return "Custom hours";

  return "Blocked time";
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    weekday: "short",
    timeZone: "Europe/London",
  }).format(new Date(`${date}T12:00:00Z`));
}

function toUpcomingOverrideItem(override: AvailabilityOverride): AdminAvailabilityData["upcomingOverrides"][number] {
  const timeLabel = override.type === "closed_day"
    ? "Full day"
    : `${override.startTime ?? "--:--"}-${override.endTime ?? "--:--"}`;

  return {
    id: override.id,
    dateLabel: formatDateLabel(override.date),
    typeLabel: getOverrideTypeLabel(override.type),
    timeLabel,
    reason: override.reason,
  };
}

export async function getAdminAvailabilitySettings(): Promise<AdminAvailabilityData> {
  const availability = await getAvailabilityPersistence();
  const workingHours = availability.rules
    .sort((a, b) => normalizeWeekdaySort(a.weekday) - normalizeWeekdaySort(b.weekday))
    .map((rule) => ({
      weekday: rule.weekday,
      weekdayLabel: weekdayLabels[rule.weekday],
      active: rule.active,
      startTime: rule.active ? rule.startTime : undefined,
      endTime: rule.active ? rule.endTime : undefined,
    }));

  return {
    isMockData: !availability.isDatabaseBacked,
    workingHours,
    upcomingOverrides: availability.overrides
      .filter((override) => override.date >= getBusinessDateString())
      .slice(0, 20)
      .map(toUpcomingOverrideItem),
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

  await seedDefaultAvailabilityIfEmpty();

  const overrideId = randomUUID();

  await query(
    `
      INSERT INTO availability_overrides (id, date, start_time, end_time, type, reason)
      VALUES ($1, $2::date, $3, $4, $5, $6)
    `,
    [
      overrideId,
      input.date,
      input.type === "blocked_time" ? input.startTime : null,
      input.type === "blocked_time" ? input.endTime : null,
      input.type,
      input.reason.trim(),
    ],
  );

  return {
    success: true,
    overrideId,
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

  await seedDefaultAvailabilityIfEmpty();

  await query(
    `
      INSERT INTO availability_rules (id, weekday, start_time, end_time, active, updated_at)
      VALUES ($1, $2, $3, $4, $5, now())
      ON CONFLICT (weekday)
      DO UPDATE SET
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        active = EXCLUDED.active,
        updated_at = now()
    `,
    [
      randomUUID(),
      input.weekday,
      input.active ? input.startTime : "00:00",
      input.active ? input.endTime : "00:00",
      input.active,
    ],
  );

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
  return isValidDateString(value);
}

function normalizeWeekdaySort(weekday: Weekday) {
  return weekday === 0 ? 7 : weekday;
}
