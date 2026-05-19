import { createAbsoluteUrl } from "./site-config";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function createBreadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: createAbsoluteUrl(item.path) ?? item.path,
    })),
  };
}

export const publicBreadcrumbs = {
  services: [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ],
  serviceArea: [
    { name: "Home", path: "/" },
    { name: "Service Areas", path: "/service-area" },
  ],
  gallery: [
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
  ],
  faq: [
    { name: "Home", path: "/" },
    { name: "FAQ", path: "/faq" },
  ],
  policies: [
    { name: "Home", path: "/" },
    { name: "Policies", path: "/policies" },
  ],
  contact: [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ],
  booking: [
    { name: "Home", path: "/" },
    { name: "Booking", path: "/booking" },
  ],
} as const;
