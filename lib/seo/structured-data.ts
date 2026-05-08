import { createBreadcrumbJsonLd } from "./breadcrumbs";
import { createFaqPageJsonLd, type FaqSchemaItem } from "./faq-schema";
import { createLocalBusinessJsonLd } from "./local-business";
import { createServiceJsonLd } from "./service-schema";

export type JsonLd = Record<string, unknown>;

export type GalleryImageJsonLdInput = {
  name: string;
  imageUrl: string;
  description?: string;
  altText?: string;
};

export function stringifyJsonLd(jsonLd: JsonLd | JsonLd[]) {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

export function createStructuredDataScript(jsonLd: JsonLd | JsonLd[]) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: stringifyJsonLd(jsonLd),
    },
  };
}

export function createGalleryImageJsonLd(input: GalleryImageJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: input.name,
    contentUrl: input.imageUrl,
    description: input.description,
    caption: input.altText,
  };
}

export {
  createBreadcrumbJsonLd,
  createFaqPageJsonLd,
  createLocalBusinessJsonLd,
  createServiceJsonLd,
};

export type { FaqSchemaItem };
