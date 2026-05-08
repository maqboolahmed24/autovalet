import { DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT, defaultServiceZones } from "./default-zones";
import {
  compactPostcode,
  getOutwardCode,
  getPostcodeDistrict,
  isValidFullUkPostcode,
  normalizePostcode,
  normalizeRegionName,
  normalizeServiceZoneValue,
} from "./normalize-postcode";
import type { ServiceZone, ServiceZoneType, ZoneValidationInput, ZoneValidationOptions, ZoneValidationResult } from "./types";

export class ZoneValidationError extends Error {
  code: "POSTCODE_REQUIRED" | "INVALID_INPUT";

  constructor(code: ZoneValidationError["code"], message: string) {
    super(message);
    this.name = "ZoneValidationError";
    this.code = code;
  }
}

function activeZonesByType(zones: ServiceZone[], type: ServiceZoneType) {
  return zones.filter((zone) => zone.active && zone.type === type);
}

function findZoneMatch(zones: ServiceZone[], type: ServiceZoneType, value: string) {
  const normalizedValue = normalizeServiceZoneValue(type, value);

  return activeZonesByType(zones, type).find((zone) => zone.normalizedValue === normalizedValue);
}

function findExactPostcodeMatch(zones: ServiceZone[], postcode: string) {
  const compactValue = compactPostcode(postcode);

  return activeZonesByType(zones, "exact_postcode").find(
    (zone) => compactPostcode(zone.normalizedValue) === compactValue,
  );
}

function standardZoneResult(matchType: ServiceZoneType, matchedValue: string): ZoneValidationResult {
  return {
    allowed: true,
    zoneStatus: "standard_zone",
    matchType,
    matchedValue,
    message: "This location is inside the standard service area.",
  };
}

export function validateServiceZone(
  input: ZoneValidationInput,
  options: ZoneValidationOptions = {},
): ZoneValidationResult {
  const normalizedPostcode = normalizePostcode(input.postcode);

  if (!normalizedPostcode) {
    throw new ZoneValidationError("POSTCODE_REQUIRED", "Please enter a postcode before checking the service area.");
  }

  if (!isValidFullUkPostcode(normalizedPostcode)) {
    throw new ZoneValidationError("INVALID_INPUT", "Enter a valid UK postcode.");
  }

  const zones = options.zones ?? defaultServiceZones;
  const requiredVehicleCount = options.minOutsideZoneVehicleCount ?? DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT;
  const vehicleCount = Number.isFinite(input.vehicleCount) ? Math.max(Math.floor(input.vehicleCount), 0) : 0;
  const outwardCode = getOutwardCode(normalizedPostcode);
  const districtCode = getPostcodeDistrict(normalizedPostcode);
  const regionName = input.regionName ? normalizeRegionName(input.regionName) : "";
  const exactMatch = findExactPostcodeMatch(zones, normalizedPostcode);

  if (exactMatch) {
    return standardZoneResult("exact_postcode", exactMatch.value);
  }

  const outwardMatch = outwardCode ? findZoneMatch(zones, "outward_code", outwardCode) : undefined;

  if (outwardMatch) {
    return standardZoneResult("outward_code", outwardMatch.value);
  }

  const districtMatch = districtCode ? findZoneMatch(zones, "district", districtCode) : undefined;

  if (districtMatch) {
    return standardZoneResult("district", districtMatch.value);
  }

  const regionMatch = regionName ? findZoneMatch(zones, "region", regionName) : undefined;

  if (regionMatch) {
    return standardZoneResult("region", regionMatch.value);
  }

  if (vehicleCount >= requiredVehicleCount) {
    return {
      allowed: true,
      zoneStatus: "outside_zone_volume_exception",
      matchType: "volume_exception",
      requiredVehicleCount,
      message: "This location is outside the usual service area, but 3+ vehicles may be considered for review.",
    };
  }

  return {
    allowed: false,
    zoneStatus: "outside_service_area",
    requiredVehicleCount,
    message: "This location is outside the usual service area. AUTO VALET can consider 3+ vehicles at the same address.",
  };
}
