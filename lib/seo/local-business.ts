import { createAbsoluteUrl, siteConfig } from "./site-config";

export function createLocalBusinessJsonLd() {
  const url = createAbsoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    name: siteConfig.business.name,
    legalName: siteConfig.business.legalName,
    telephone: siteConfig.business.phone,
    email: siteConfig.business.email,
    address: siteConfig.business.registeredOfficeAddress,
    ...(url ? { url } : {}),
    areaServed: siteConfig.business.areaServed,
    priceRange: "££",
    serviceType: "Premium mobile car detailing",
  };
}
