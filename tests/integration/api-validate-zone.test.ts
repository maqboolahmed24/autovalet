import { describe, expect, it } from "vitest";
import { POST } from "../../app/api/validate-zone/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/validate-zone", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/validate-zone", () => {
  it("returns a standard zone response", async () => {
    const response = await POST(jsonRequest({ postcode: "Rochdale", vehicleCount: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.zoneStatus).toBe("standard_zone");
    expect(body.data.matchType).toBe("region");
  });

  it("accepts a configured city or region name", async () => {
    const response = await POST(jsonRequest({ postcode: "Manchester", vehicleCount: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.zoneStatus).toBe("standard_zone");
    expect(body.data.matchType).toBe("region");
  });

  it("returns active city recommendations for close misspellings", async () => {
    const response = await POST(jsonRequest({ postcode: "Rochdal", vehicleCount: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.allowed).toBe(false);
    expect(body.data.suggestions).toEqual([{ type: "region", value: "Rochdale" }]);
  });

  it("blocks outside-zone requests below 3 vehicles", async () => {
    const response = await POST(jsonRequest({ postcode: "Leeds", vehicleCount: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.allowed).toBe(false);
  });
});
