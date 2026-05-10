import { describe, expect, it } from "vitest";
import {
  createUtcDateFromBusinessTime,
  generateAvailableSlots,
  hasMinuteOverlap,
  slotIncrementMinutes,
} from "../../lib/availability";

describe("slot generation", () => {
  it("uses 15-minute increments", () => {
    const slots = generateAvailableSlots({ date: "2026-05-18", serviceDurationMinutes: 60 });

    expect(slotIncrementMinutes).toBe(15);
    expect(slots[0]?.label).toBe("09:00");
    expect(slots[1]?.label).toBe("09:15");
  });

  it("requires the service to end inside working hours", () => {
    const slots = generateAvailableSlots({ date: "2026-05-18", serviceDurationMinutes: 60 });

    expect(slots.some((slot) => slot.label === "16:00")).toBe(true);
    expect(slots.some((slot) => slot.label === "16:15")).toBe(false);
  });

  it("does not offer strict slots when the service is longer than the working day", () => {
    const slots = generateAvailableSlots({ date: "2026-05-18", serviceDurationMinutes: 540 });

    expect(slots.length).toBe(0);
  });

  it("can offer early extended request slots when the service is longer than the working day", () => {
    const slots = generateAvailableSlots({
      date: "2026-05-18",
      serviceDurationMinutes: 540,
      allowExtendedServiceRequest: true,
    });

    expect(slots[0]?.label).toBe("09:00");
    expect(slots.at(-1)?.label).toBe("11:00");
    expect(slots.every((slot) => slot.isExtendedRequest)).toBe(true);
  });

  it("allows buffer to extend after closing", () => {
    const slot = generateAvailableSlots({ date: "2026-05-18", serviceDurationMinutes: 60 }).find(
      (candidate) => candidate.label === "16:00",
    );

    expect(slot?.blockedUntil).toBeTruthy();
  });

  it("blocks slots overlapping approved bookings", () => {
    const slots = generateAvailableSlots({
      date: "2026-05-18",
      serviceDurationMinutes: 60,
      existingBookings: [
        {
          id: "approved",
          status: "approved",
          requestedStartAt: createUtcDateFromBusinessTime("2026-05-18", "09:00").toISOString(),
          blockedUntil: createUtcDateFromBusinessTime("2026-05-18", "10:45").toISOString(),
        },
      ],
    });

    expect(slots.some((slot) => slot.label === "09:00")).toBe(false);
  });

  it("blocks slots overlapping pending admin review requests", () => {
    const slots = generateAvailableSlots({
      date: "2026-05-18",
      serviceDurationMinutes: 60,
      existingBookings: [
        {
          id: "pending",
          status: "pending_admin_review",
          requestedStartAt: createUtcDateFromBusinessTime("2026-05-18", "09:00").toISOString(),
          blockedUntil: createUtcDateFromBusinessTime("2026-05-18", "10:45").toISOString(),
        },
      ],
    });

    expect(slots.some((slot) => slot.label === "09:15")).toBe(false);
  });

  it("blocks slots overlapping payment holds", () => {
    const slots = generateAvailableSlots({
      date: "2026-05-18",
      serviceDurationMinutes: 60,
      existingBookings: [
        {
          id: "hold",
          status: "payment_hold",
          requestedStartAt: createUtcDateFromBusinessTime("2026-05-18", "09:00").toISOString(),
          blockedUntil: createUtcDateFromBusinessTime("2026-05-18", "10:45").toISOString(),
        },
      ],
    });

    expect(slots.some((slot) => slot.label === "09:30")).toBe(false);
  });

  it("ignores declined bookings for slot blocking", () => {
    const slots = generateAvailableSlots({
      date: "2026-05-18",
      serviceDurationMinutes: 60,
      existingBookings: [
        {
          id: "declined",
          status: "declined",
          requestedStartAt: createUtcDateFromBusinessTime("2026-05-18", "09:00").toISOString(),
          blockedUntil: createUtcDateFromBusinessTime("2026-05-18", "10:45").toISOString(),
        },
      ],
    });

    expect(slots.some((slot) => slot.label === "09:00")).toBe(true);
  });

  it("allows exact boundaries where previous blockedUntil equals candidate start", () => {
    expect(hasMinuteOverlap(540, 645, 480, 540)).toBe(false);
  });
});
