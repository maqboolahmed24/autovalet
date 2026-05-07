export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TimeString = `${number}:${number}`;

export type WorkingHoursRule = {
  id: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  active: boolean;
};

export type AvailabilityOverrideType = "closed_day" | "custom_hours" | "blocked_time";

export type AvailabilityOverride = {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: AvailabilityOverrideType;
  reason?: string;
};

export type TimeWindow = {
  startTime: string;
  endTime: string;
};

export type BlockedTimeWindow = TimeWindow & {
  reason?: string;
};

export type DayAvailability = {
  date: string;
  isClosed: boolean;
  workingWindows: TimeWindow[];
  blockedWindows: BlockedTimeWindow[];
};

export type GetWorkingHoursForDateInput = {
  date: string;
  rules?: WorkingHoursRule[];
  overrides?: AvailabilityOverride[];
};
