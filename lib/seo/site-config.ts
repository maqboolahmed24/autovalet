import { greaterManchesterServiceAreas } from "../service-areas";

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
  defaultTitle: "Mobile Car Detailing Rochdale & Greater Manchester | AUTO VALET",
  defaultDescription:
    "Premium mobile car detailing and valeting across Rochdale and Greater Manchester, with maintenance cleans, deep cleans and finishing extras.",
  business: {
    name: "AUTO VALET",
    legalName: "AUTO VALET DETAILING LTD",
    phone: "07340542578",
    phoneHref: "tel:07340542578",
    email: "admin@autovaletdetailing.co.uk",
    emailHref: "mailto:admin@autovaletdetailing.co.uk",
    primaryLocation: "Rochdale",
    operatingRegion: "Greater Manchester",
    serviceAreaLabel: "Rochdale and Greater Manchester",
    serviceAreas: greaterManchesterServiceAreas,
    companyNumber: "17037650",
    registeredOfficeAddress: "43 Milnstone Road, Rochdale, England, OL11 1EB",
    postalAddress: {
      streetAddress: "43 Milnstone Road",
      addressLocality: "Rochdale",
      addressRegion: "Greater Manchester",
      postalCode: "OL11 1EB",
      addressCountry: "GB",
    },
    placeOfRegistration: "Registered in England and Wales",
    currency: "GBP",
    areaServed: greaterManchesterServiceAreas,
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
