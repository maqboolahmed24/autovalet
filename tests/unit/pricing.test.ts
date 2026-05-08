import { describe, expect, it } from "vitest";
import type { BookingDraft } from "../../lib/booking/types";
import { calculateBookingPrice, calculateDepositDue, formatMoneyGBP } from "../../lib/pricing";

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

describe("booking pricing", () => {
  it("prices Maintenance small with no add-ons at GBP 55", () => {
    expect(calculateBookingPrice(draft()).estimatedTotalMinor).toBe(5500);
  });

  it("prices Maintenance medium with engine bay at GBP 95", () => {
    const result = calculateBookingPrice(
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

    expect(result.estimatedTotalMinor).toBe(9500);
  });

  it("prices Deep Clean large with pet hair at GBP 200", () => {
    const result = calculateBookingPrice(
      draft({
        packageId: "deep_clean",
        vehicles: [
          {
            id: "vehicle-1",
            make: "Range Rover",
            model: "Sport",
            size: "large_4x4",
            addons: ["excess_pet_hair_removal"],
          },
        ],
      }),
    );

    expect(result.estimatedTotalMinor).toBe(20000);
  });

  it("multiplies service and add-on estimates for multi-vehicle requests", () => {
    const result = calculateBookingPrice(
      draft({
        vehicleCount: 3,
        vehicles: [
          {
            id: "vehicle-1",
            make: "Mini",
            model: "Cooper",
            size: "small",
            addons: ["engine_bay_clean"],
          },
        ],
      }),
    );

    expect(result.estimatedTotalMinor).toBe(25500);
  });

  it("falls back to one vehicle for malformed vehicle counts", () => {
    const result = calculateBookingPrice(draft({ vehicleCount: Number.NaN }));

    expect(result.estimatedTotalMinor).toBe(5500);
  });

  it("caps deposit at the estimated total", () => {
    expect(calculateDepositDue(2000)).toBe(2000);
  });

  it("does not produce a deposit for malformed estimated totals", () => {
    expect(calculateDepositDue(Number.NaN)).toBe(0);
  });

  it("formats GBP pence without exposing decimal pence", () => {
    expect(formatMoneyGBP(5500)).toBe("£55");
  });
});
