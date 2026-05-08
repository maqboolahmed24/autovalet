import { describe, expect, it } from "vitest";
import type { BookingDraft } from "../../lib/booking/types";
import { calculateBookingDuration } from "../../lib/pricing";

function draft(overrides: Partial<BookingDraft> = {}): BookingDraft {
  return {
    packageId: "maintenance",
    vehicles: [
      {
        id: "vehicle-1",
        make: "BMW",
        model: "3 Series",
        size: "small",
        addons: [],
      },
    ],
    postcode: "CR0 1AA",
    fullAddress: "Example address",
    parkingAvailable: "yes",
    parkingNotes: "",
    accessNotes: "",
    zoneCheckStatus: "standard_zone",
    vehicleCount: 1,
    selectedDate: "2026-05-18",
    selectedSlotStart: "09:00",
    customer: {
      fullName: "Customer",
      phone: "07123456789",
      email: "customer@example.com",
    },
    extraNotes: "",
    marketingPhotoConsent: false,
    ...overrides,
  };
}

describe("booking duration", () => {
  it("calculates Maintenance small as 60 service minutes", () => {
    expect(calculateBookingDuration(draft()).serviceDurationMinutes).toBe(60);
  });

  it("includes engine bay duration for a medium Maintenance booking", () => {
    const result = calculateBookingDuration(
      draft({
        vehicles: [
          {
            id: "vehicle-1",
            make: "BMW",
            model: "3 Series",
            size: "medium",
            addons: ["engine_bay_clean"],
          },
        ],
      }),
    );

    expect(result.serviceDurationMinutes).toBe(95);
  });

  it("uses configured Deep Clean large duration", () => {
    const result = calculateBookingDuration(
      draft({
        packageId: "deep_clean",
        vehicles: [
          {
            id: "vehicle-1",
            make: "Range Rover",
            model: "Sport",
            size: "large_4x4",
            addons: [],
          },
        ],
      }),
    );

    expect(result.serviceDurationMinutes).toBe(210);
  });

  it("adds one travel buffer for a multi-vehicle location visit", () => {
    const result = calculateBookingDuration(draft({ vehicleCount: 3 }));

    expect(result.serviceDurationMinutes).toBe(180);
    expect(result.travelBufferMinutes).toBe(45);
  });

  it("falls back to one vehicle for malformed vehicle counts", () => {
    const result = calculateBookingDuration(draft({ vehicleCount: Number.NaN }));

    expect(result.serviceDurationMinutes).toBe(60);
  });

  it("includes selected add-on duration", () => {
    const result = calculateBookingDuration(
      draft({
        vehicles: [
          {
            id: "vehicle-1",
            make: "BMW",
            model: "3 Series",
            size: "small",
            addons: ["liquid_decon_clay_bar"],
          },
        ],
      }),
    );

    expect(result.serviceDurationMinutes).toBe(110);
  });

  it("returns blocked duration as service duration plus 45-minute buffer", () => {
    const result = calculateBookingDuration(draft());

    expect(result.blockedDurationMinutes).toBe(105);
  });
});
