import type { ServiceZoneType } from "./types";

export function normalizePostcode(value: string) {
  const compactValue = value.trim().toUpperCase().replace(/\s+/g, "");

  if (/^(GIR0AA|[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2})$/.test(compactValue)) {
    return `${compactValue.slice(0, -3)} ${compactValue.slice(-3)}`;
  }

  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

export function compactPostcode(value: string) {
  return normalizePostcode(value).replace(/\s/g, "");
}

export function getOutwardCode(value: string) {
  return normalizePostcode(value).split(" ")[0] ?? "";
}

export function getPostcodeArea(value: string) {
  return getOutwardCode(value).match(/^[A-Z]+/)?.[0] ?? "";
}

export function getPostcodeDistrict(value: string) {
  const outward = getOutwardCode(value);
  const match = outward.match(/^[A-Z]{1,2}\d{1,2}[A-Z]?/);

  return match?.[0] ?? outward;
}

export function normalizeRegionName(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

export function normalizeServiceZoneValue(type: ServiceZoneType, value: string) {
  if (type === "exact_postcode") return normalizePostcode(value);
  if (type === "region") return normalizeRegionName(value);

  return value.trim().toUpperCase().replace(/\s+/g, "");
}
