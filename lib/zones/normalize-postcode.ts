import type { ServiceZoneType } from "./types";

const fullUkPostcodePattern = /^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i;
const outwardCodePattern = /^[A-Z]{1,2}\d[A-Z\d]?$/i;
const regionNamePattern = /^[A-Z][A-Z0-9 '&.-]*$/i;

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

export function isValidFullUkPostcode(value: string) {
  return fullUkPostcodePattern.test(value.trim());
}

export function isValidPostcodeAreaValue(value: string) {
  return outwardCodePattern.test(value.trim());
}

export function isValidRegionNameValue(value: string) {
  const normalizedValue = normalizeRegionName(value);

  return normalizedValue.length >= 2 && regionNamePattern.test(normalizedValue);
}

export function isValidServiceZoneValue(type: ServiceZoneType, value: string) {
  if (type === "exact_postcode") return isValidFullUkPostcode(value);
  if (type === "outward_code" || type === "district") return isValidPostcodeAreaValue(value);

  return isValidRegionNameValue(value);
}
