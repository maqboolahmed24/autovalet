import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "../../app/api/create-booking-request/route";

let originalDatabaseUrl: string | undefined;

beforeEach(() => {
  originalDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/create-booking-request", {
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
  postcode: "CR0 1AA",
  fullAddress: "10 Example Road",
  parkingAvailable: "yes",
  parkingNotes: "",
  accessNotes: "",
  zoneCheckStatus: "standard_zone",
  vehicleCount: 1,
  selectedDate: "2026-05-18",
  selectedSlotStart: "09:00",
  customer: {
    fullName: "Sarah Wilson",
    phone: "07123456789",
    email: "sarah@example.com",
  },
  extraNotes: "",
  marketingPhotoConsent: false,
};

describe("POST /api/create-booking-request", () => {
  it("validates missing booking draft data", async () => {
    const response = await POST(jsonRequest({ idempotencyKey: "client_test_key_123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_BOOKING_DRAFT");
  });

  it("fails safely when booking persistence is not configured", async () => {
    const response = await POST(jsonRequest({ draft: validDraft, idempotencyKey: "client_test_key_456" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("BOOKING_PERSISTENCE_NOT_CONFIGURED");
  });

  it("rejects past requested slots before persistence", async () => {
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
    expect(body.error.code).toBe("BOOKING_VALIDATION_FAILED");
  });
});
