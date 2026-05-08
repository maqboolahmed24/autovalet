import { describe, expect, it } from "vitest";
import {
  getWorkingHoursForDate,
  parseTimeToMinutes,
} from "../../lib/availability";

describe("availability foundation", () => {
  it("returns Monday default hours", () => {
    const availability = getWorkingHoursForDate({ date: "2026-05-18" });

    expect(availability.isClosed).toBe(false);
    expect(availability.workingWindows[0]).toEqual({ startTime: "09:00", endTime: "17:00" });
  });

  it("returns Sunday as closed by default", () => {
    const availability = getWorkingHoursForDate({ date: "2026-05-17" });

    expect(availability.isClosed).toBe(true);
  });

  it("applies closed-day overrides", () => {
    const availability = getWorkingHoursForDate({
      date: "2026-05-18",
      overrides: [{ id: "closed", date: "2026-05-18", type: "closed_day", reason: "Holiday" }],
    });

    expect(availability.isClosed).toBe(true);
  });

  it("replaces normal hours with custom hours", () => {
    const availability = getWorkingHoursForDate({
      date: "2026-05-18",
      overrides: [
        { id: "custom", date: "2026-05-18", type: "custom_hours", startTime: "10:00", endTime: "15:00" },
      ],
    });

    expect(availability.workingWindows[0]).toEqual({ startTime: "10:00", endTime: "15:00" });
  });

  it("returns blocked-time overrides", () => {
    const availability = getWorkingHoursForDate({
      date: "2026-05-18",
      overrides: [
        {
          id: "blocked",
          date: "2026-05-18",
          type: "blocked_time",
          startTime: "12:00",
          endTime: "14:00",
          reason: "Van maintenance",
        },
      ],
    });

    expect(availability.blockedWindows[0]).toEqual({
      startTime: "12:00",
      endTime: "14:00",
      reason: "Van maintenance",
    });
  });

  it("fails safely for invalid time strings", () => {
    expect(() => parseTimeToMinutes("25:99")).toThrow("Invalid time string");
  });
});
