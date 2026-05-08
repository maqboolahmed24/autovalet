import { addonList, getServicePriceRange, servicePackageList } from "../pricing/catalog";
import { formatMoneyGBP } from "../pricing";
import { createAbsoluteUrl, siteConfig } from "./site-config";

export function createServiceJsonLd() {
  const providerUrl = createAbsoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AUTO VALET services",
    itemListElement: [
      ...servicePackageList.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: `${service.label} Clean`,
          description: service.description,
          provider: {
            "@type": "AutoWash",
            name: siteConfig.business.name,
            ...(providerUrl ? { url: providerUrl } : {}),
          },
          areaServed: siteConfig.business.areaServed,
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: siteConfig.business.currency,
            lowPrice: getServicePriceRange(service.id).minMinor / 100,
            offerCount: Object.keys(service.variants).length,
          },
        },
      })),
      {
        "@type": "ListItem",
        position: servicePackageList.length + 1,
        item: {
          "@type": "Service",
          name: "Finishing extras and add-ons",
          description: addonList.map((addon) => `${addon.label} (${formatMoneyGBP(addon.priceMinor)})`).join(", "),
          provider: {
            "@type": "AutoWash",
            name: siteConfig.business.name,
            ...(providerUrl ? { url: providerUrl } : {}),
          },
          areaServed: siteConfig.business.areaServed,
        },
      },
    ],
  };
}
