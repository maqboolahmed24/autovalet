import type { Weekday, WorkingHoursRule } from "./types";

export const BUSINESS_TIMEZONE = "Europe/London";
export const DEFAULT_SERVICE_MUST_END_INSIDE_WORKING_HOURS = true;
export const DEFAULT_TRAVEL_BUFFER_MAY_EXTEND_AFTER_CLOSING = true;

const defaultWorkingHoursRules = [
  {
    id: "default-sunday-closed",
    weekday: 0,
    startTime: "00:00",
    endTime: "00:00",
    active: false,
  },
  {
    id: "default-monday",
    weekday: 1,
    startTime: "09:00",
    endTime: "17:00",
    active: true,
  },
  {
    id: "default-tuesday",
    weekday: 2,
    startTime: "09:00",
    endTime: "17:00",
    active: true,
  },
  {
    id: "default-wednesday",
    weekday: 3,
    startTime: "09:00",
    endTime: "17:00",
    active: true,
  },
  {
    id: "default-thursday",
    weekday: 4,
    startTime: "09:00",
    endTime: "17:00",
    active: true,
  },
  {
    id: "default-friday",
    weekday: 5,
    startTime: "09:00",
    endTime: "17:00",
    active: true,
  },
  {
    id: "default-saturday",
    weekday: 6,
    startTime: "09:00",
    endTime: "16:00",
    active: true,
  },
] as const satisfies readonly WorkingHoursRule[];

export function getDefaultWorkingHoursRules(): WorkingHoursRule[] {
  return defaultWorkingHoursRules.map((rule) => ({
    ...rule,
    weekday: rule.weekday as Weekday,
  }));
}
