import type { MetadataRoute } from "next";
import { createAbsoluteUrl, getConfiguredSiteUrl } from "../lib/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getConfiguredSiteUrl();
  const sitemap = createAbsoluteUrl("/sitemap.xml");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin", "/booking/status"],
    },
    sitemap,
    host: siteUrl?.origin,
  };
}
