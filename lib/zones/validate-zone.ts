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
import type {
  ServiceZone,
  ServiceZoneType,
  ZoneValidationInput,
  ZoneValidationOptions,
  ZoneValidationResult,
  ZoneValidationSuggestion,
} from "./types";

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

function normalizeSuggestionSearchValue(value: string) {
  return normalizeRegionName(value).replace(/[^A-Z0-9]/g, "");
}

function getEditDistance(a: string, b: string) {
  const previousRow = Array.from({ length: b.length + 1 }, (_, index) => index);
  const currentRow = Array.from({ length: b.length + 1 }, () => 0);

  for (let aIndex = 1; aIndex <= a.length; aIndex += 1) {
    currentRow[0] = aIndex;

    for (let bIndex = 1; bIndex <= b.length; bIndex += 1) {
      const substitutionCost = a[aIndex - 1] === b[bIndex - 1] ? 0 : 1;

      currentRow[bIndex] = Math.min(
        previousRow[bIndex] + 1,
        currentRow[bIndex - 1] + 1,
        previousRow[bIndex - 1] + substitutionCost,
      );
    }

    previousRow.splice(0, previousRow.length, ...currentRow);
  }

  return previousRow[b.length] ?? 0;
}

function getRegionSuggestions(zones: ServiceZone[], value: string): ZoneValidationSuggestion[] {
  const normalizedValue = normalizeSuggestionSearchValue(value);

  if (normalizedValue.length < 4) {
    return [];
  }

  return activeZonesByType(zones, "region")
    .map((zone) => {
      const normalizedZoneValue = normalizeSuggestionSearchValue(zone.normalizedValue || zone.value);
      const distance = getEditDistance(normalizedValue, normalizedZoneValue);
      const shortestLength = Math.min(normalizedValue.length, normalizedZoneValue.length);
      const threshold = shortestLength <= 4 ? 1 : Math.min(2, Math.ceil(shortestLength * 0.25));

      return {
        distance,
        threshold,
        suggestion: {
          type: "region" as const,
          value: zone.value,
        },
      };
    })
    .filter(({ distance, threshold }) => distance > 0 && distance <= threshold)
    .sort((a, b) => a.distance - b.distance || a.suggestion.value.localeCompare(b.suggestion.value))
    .slice(0, 3)
    .map(({ suggestion }) => suggestion);
}

export function validateServiceZone(
  input: ZoneValidationInput,
  options: ZoneValidationOptions = {},
): ZoneValidationResult {
  const submittedPostcode = input.postcode.trim();
  const explicitRegionName = input.regionName ? normalizeRegionName(input.regionName) : "";
  const normalizedPostcode = submittedPostcode ? normalizePostcode(submittedPostcode) : "";
  const hasFullPostcode = normalizedPostcode ? isValidFullUkPostcode(normalizedPostcode) : false;
  const submittedRegionName = submittedPostcode ? normalizeRegionName(submittedPostcode) : "";

  if (!submittedPostcode && !explicitRegionName) {
    throw new ZoneValidationError("POSTCODE_REQUIRED", "Please enter a postcode, town or city before checking the service area.");
  }

  const zones = options.zones ?? defaultServiceZones;
  const requiredVehicleCount = options.minOutsideZoneVehicleCount ?? DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT;
  const vehicleCount = Number.isFinite(input.vehicleCount) ? Math.max(Math.floor(input.vehicleCount), 0) : 0;
  const outwardCode = normalizedPostcode ? getOutwardCode(normalizedPostcode) : "";
  const districtCode = normalizedPostcode ? getPostcodeDistrict(normalizedPostcode) : "";
  const regionName = explicitRegionName || (!hasFullPostcode ? submittedRegionName : "");
  const regionSearchValue =
    explicitRegionName && explicitRegionName !== submittedRegionName
      ? explicitRegionName
      : !hasFullPostcode
        ? regionName
        : "";
  const exactMatch = hasFullPostcode ? findExactPostcodeMatch(zones, normalizedPostcode) : undefined;

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

  const suggestions = regionSearchValue ? getRegionSuggestions(zones, regionSearchValue) : [];

  if (vehicleCount >= requiredVehicleCount) {
    return {
      allowed: true,
      zoneStatus: "outside_zone_volume_exception",
      matchType: "volume_exception",
      requiredVehicleCount,
      message: "This location is outside the usual service area, but 3+ vehicles may be considered for review.",
      suggestions,
    };
  }

  return {
    allowed: false,
    zoneStatus: "outside_service_area",
    requiredVehicleCount,
    message: "This location is outside the usual service area. AUTO VALET can consider 3+ vehicles at the same address.",
    suggestions,
  };
}
