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
    "Premium mobile car detailing at your location. Request maintenance cleans, deep cleans and finishing extras with manual booking approval.",
  business: {
    name: "AUTO VALET",
    legalName: "AUTO VALET DETAILING LTD",
    phone: "07340542578",
    phoneHref: "tel:07340542578",
    email: "admin@autovaledetailing.co.uk",
    emailHref: "mailto:admin@autovaledetailing.co.uk",
    operatingRegion: "Greater Manchester and Surrounding areas",
    companyNumber: "17037650",
    registeredOfficeAddress: "43 Milnstone Road, Rochdale, England, OL11 1EB",
    placeOfRegistration: "Registered in England and Wales",
    currency: "GBP",
    areaServed: ["Greater Manchester and Surrounding areas"],
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
