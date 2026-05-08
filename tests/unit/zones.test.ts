import { describe, expect, it } from "vitest";
import type { ServiceZone } from "../../lib/zones";
import { normalizePostcode, validateServiceZone, ZoneValidationError } from "../../lib/zones";

const zones: ServiceZone[] = [
  {
    id: "exact-cr0-1aa",
    type: "exact_postcode",
    value: "CR0 1AA",
    normalizedValue: "CR0 1AA",
    active: true,
  },
  {
    id: "district-sw1a",
    type: "district",
    value: "SW1A",
    normalizedValue: "SW1A",
    active: true,
  },
  {
    id: "region-croydon",
    type: "region",
    value: "Croydon",
    normalizedValue: "CROYDON",
    active: true,
  },
];

describe("service zone validation", () => {
  it("normalizes lowercase UK postcodes", () => {
    expect(normalizePostcode("sw1a 1aa")).toBe("SW1A 1AA");
  });

  it("matches exact postcodes", () => {
    const result = validateServiceZone({ postcode: "cr0 1aa", vehicleCount: 1 }, { zones });

    expect(result.allowed).toBe(true);
    if (!result.allowed) throw new Error("Expected allowed zone result");
    expect(result.zoneStatus).toBe("standard_zone");
    expect(result.matchType).toBe("exact_postcode");
  });

  it("matches postcode districts", () => {
    const result = validateServiceZone({ postcode: "SW1A 2AA", vehicleCount: 1 }, { zones });

    expect(result.allowed).toBe(true);
    if (!result.allowed) throw new Error("Expected allowed zone result");
    expect(result.matchType).toBe("district");
  });

  it("matches regions", () => {
    const result = validateServiceZone(
      { postcode: "BR1 1AA", regionName: "croydon", vehicleCount: 1 },
      { zones },
    );

    expect(result.allowed).toBe(true);
    if (!result.allowed) throw new Error("Expected allowed zone result");
    expect(result.matchType).toBe("region");
  });

  it("blocks outside-zone requests below 3 vehicles", () => {
    const result = validateServiceZone({ postcode: "BR1 1AA", vehicleCount: 1 }, { zones });

    expect(result.allowed).toBe(false);
    expect(result.zoneStatus).toBe("outside_service_area");
  });

  it("allows outside-zone requests with 3 vehicles as volume review", () => {
    const result = validateServiceZone({ postcode: "BR1 1AA", vehicleCount: 3 }, { zones });

    expect(result.allowed).toBe(true);
    expect(result.zoneStatus).toBe("outside_zone_volume_exception");
  });

  it("treats empty postcodes as validation errors", () => {
    expect(() => validateServiceZone({ postcode: "", vehicleCount: 1 }, { zones })).toThrow(
      ZoneValidationError,
    );
  });
});
