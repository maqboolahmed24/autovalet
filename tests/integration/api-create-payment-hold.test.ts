import { describe, expect, it } from "vitest";
import { POST } from "../../app/api/create-payment-hold/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/create-payment-hold", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validDraft = {
  packageId: "maintenance",
  vehicles: [
    {
      id: "vehicle-1",
      make: "BMW",
      model: "3 Series",
      size: "medium",
      addons: ["engine_bay_clean"],
    },
  ],
  postcode: "Rochdale",
  fullAddress: "10 Example Road",
  parkingAvailable: "yes",
  accessToWaterAvailable: true,
  accessToElectricityAvailable: true,
  accessibleParkingLocation: true,
  parkingNotes: "",
  accessNotes: "",
  zoneCheckStatus: "standard_zone",
  vehicleCount: 1,
  selectedDate: "2026-05-25",
  selectedSlotStart: "09:00",
  customer: {
    fullName: "Sarah Wilson",
    phone: "07123456789",
    email: "sarah@example.com",
  },
  extraNotes: "",
  marketingPhotoConsent: false,
};

describe("POST /api/create-payment-hold", () => {
  it("validates missing booking draft data", async () => {
    const response = await POST(jsonRequest({ idempotencyKey: "client_test_key_123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_BOOKING_DRAFT");
  });

  it("fails safely while checkout persistence or provider setup is missing", async () => {
    const response = await POST(jsonRequest({ draft: validDraft, idempotencyKey: "client_test_key_456" }));
    const body = await response.json();

    expect([400, 503]).toContain(response.status);
    expect(body.success).toBe(false);
    expect([
      "INVALID_DEPOSIT_AMOUNT",
      "PAYMENT_HOLD_PERSISTENCE_NOT_CONFIGURED",
      "PAYMENT_PROVIDER_NOT_CONFIGURED",
    ]).toContain(
      body.error.code,
    );
  });

  it("rejects past requested slots before payment hold creation", async () => {
    const response = await POST(
      jsonRequest({
        draft: {
          ...validDraft,
          selectedDate: "2020-01-01",
          selectedSlotStart: "09:00",
        },
        idempotencyKey: "client_test_key_789",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });
});
