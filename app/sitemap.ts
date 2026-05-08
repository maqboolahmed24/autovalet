import type { MetadataRoute } from "next";
import { publicRouteMetadata } from "../lib/seo/public-metadata";
import { createAbsoluteUrl } from "../lib/seo/site-config";

const sitemapRouteKeys = [
  "home",
  "services",
  "gallery",
  "booking",
  "faq",
  "contact",
  "policies",
  "privacy",
  "terms",
  "depositCancellation",
  "cookies",
  "dataRequests",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRouteKeys.flatMap((routeKey) => {
    const url = createAbsoluteUrl(publicRouteMetadata[routeKey].path);

    return url
      ? [
          {
            url,
            lastModified: new Date(),
            changeFrequency: routeKey === "home" ? "weekly" : "monthly",
            priority: routeKey === "home" ? 1 : routeKey === "booking" ? 0.9 : 0.7,
          },
        ]
      : [];
  });
}
