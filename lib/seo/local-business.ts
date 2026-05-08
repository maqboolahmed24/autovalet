import { createAbsoluteUrl, siteConfig } from "./site-config";

export function createLocalBusinessJsonLd() {
  const url = createAbsoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    name: siteConfig.business.name,
    ...(url ? { url } : {}),
    areaServed: siteConfig.business.areaServed,
    priceRange: "££",
    serviceType: "Premium mobile car detailing",
  };
}
