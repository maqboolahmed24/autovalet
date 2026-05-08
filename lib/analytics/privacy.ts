import type { AnalyticsProperties } from "./events";

const forbiddenAnalyticsKeys = [
  "fullName",
  "name",
  "email",
  "phone",
  "fullAddress",
  "address",
  "postcode",
  "paymentProviderId",
  "providerPaymentId",
  "bookingId",
  "bookingReference",
  "notes",
  "vehicleRegistration",
  "registration",
] as const;

export function sanitizeAnalyticsPath(path: string) {
  return path
    .replace(/\/booking\/status\/[^/?#]+/g, "/booking/status/[reference]")
    .replace(/[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/gi, "[postcode]");
}

export function sanitizeAnalyticsProperties(properties: AnalyticsProperties = {}): AnalyticsProperties {
  const sanitized: AnalyticsProperties = {};
  const entries = Object.entries(properties) as [keyof AnalyticsProperties, AnalyticsProperties[keyof AnalyticsProperties]][];

  for (const [key, value] of entries) {
    if (value === undefined || forbiddenAnalyticsKeys.includes(key as never)) {
      continue;
    }

    if (key === "pagePath" && typeof value === "string") {
      sanitized.pagePath = sanitizeAnalyticsPath(value);
      continue;
    }

    sanitized[key] = value as never;
  }

  return sanitized;
}

export function isAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}
