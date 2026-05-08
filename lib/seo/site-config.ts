function readEnvironmentVariable(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getConfiguredSiteUrlValue() {
  return (
    readEnvironmentVariable("NEXT_PUBLIC_SITE_URL") ||
    readEnvironmentVariable("SITE_URL") ||
    (readEnvironmentVariable("VERCEL_URL") ? `https://${readEnvironmentVariable("VERCEL_URL")}` : "")
  );
}

export const siteConfig = {
  siteName: "AUTO VALET",
  siteUrl: getConfiguredSiteUrlValue(),
  defaultTitle: "AUTO VALET | Premium Mobile Car Detailing",
  defaultDescription:
    "Premium mobile car detailing at your location. Request maintenance cleans, deep cleans and finishing extras with deposit-secured booking approval.",
  business: {
    name: "AUTO VALET",
    currency: "GBP",
    areaServed: ["Selected service areas"],
  },
} as const;

export function getConfiguredSiteUrl() {
  if (!siteConfig.siteUrl) {
    return undefined;
  }

  try {
    return new URL(siteConfig.siteUrl);
  } catch {
    return undefined;
  }
}

export function getSiteUrl() {
  return getConfiguredSiteUrl() ?? new URL("http://localhost:3000");
}

export function createAbsoluteUrl(path: string) {
  const siteUrl = getConfiguredSiteUrl();

  return siteUrl ? new URL(path, siteUrl).toString() : undefined;
}
