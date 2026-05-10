import { describe, expect, it } from "vitest";
import { POST } from "../../app/api/available-slots/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/available-slots", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/available-slots", () => {
  it("returns a valid requested slot list", async () => {
    const response = await POST(
      jsonRequest({
        date: "2026-05-18",
        packageId: "maintenance",
        vehicles: [{ size: "medium", addons: ["engine_bay_clean"] }],
        vehicleCount: 1,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.slots.length).toBeGreaterThan(0);
    expect(body.data.slots[0].serviceDurationMinutes).toBe(95);
  });

  it("returns extended request slots for services that do not fit inside the day", async () => {
    const response = await POST(
      jsonRequest({
        date: "2026-05-18",
        packageId: "deep_clean",
        vehicles: [{ size: "medium", addons: [] }],
        vehicleCount: 3,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.serviceDurationMinutes).toBe(540);
    expect(body.data.slots.length).toBeGreaterThan(0);
    expect(body.data.slots.every((slot: { isExtendedRequest: boolean }) => slot.isExtendedRequest)).toBe(true);
  });

  it("rejects past requested dates", async () => {
    const response = await POST(
      jsonRequest({
        date: "2020-01-01",
        packageId: "maintenance",
        vehicles: [{ size: "medium", addons: [] }],
        vehicleCount: 1,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });
});
