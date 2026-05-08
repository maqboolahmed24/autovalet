"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackAnalyticsEvent, trackPageView } from "../../lib/analytics/provider";

export function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);

    if (pathname === "/") {
      trackAnalyticsEvent("homepage_viewed", {
        pagePath: pathname,
      });
    }
  }, [pathname]);

  return null;
}
