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
    address: {
      "@type": "PostalAddress",
      ...siteConfig.business.postalAddress,
    },
    ...(url ? { url } : {}),
    areaServed: siteConfig.business.areaServed.map((area) => ({
      "@type": "AdministrativeArea",
      name: area,
    })),
    description: `Premium mobile car detailing and valeting across ${siteConfig.business.serviceAreaLabel}.`,
    priceRange: "££",
    serviceType: "Premium mobile car detailing and valeting",
  };
}
