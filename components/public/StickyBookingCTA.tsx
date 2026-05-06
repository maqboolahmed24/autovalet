"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type StickyBookingCTAProps = {
  threshold?: number;
};

export function StickyBookingCTA({ threshold = 520 }: StickyBookingCTAProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const shouldHideForRoute =
    pathname?.startsWith("/booking") ||
    pathname?.startsWith("/payment") ||
    pathname?.startsWith("/booking-status") ||
    pathname?.startsWith("/reschedule");

  useEffect(() => {
    if (shouldHideForRoute) {
      setIsVisible(false);
      return;
    }

    const updateVisibility = () => {
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const heroThreshold = hero ? hero.offsetHeight * 0.7 : threshold;
      setIsVisible(window.scrollY > heroThreshold);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [shouldHideForRoute, threshold]);

  if (shouldHideForRoute) {
    return null;
  }

  return (
    <div className={`mobile-sticky-cta sticky-booking-cta${isVisible ? " is-visible" : ""}`}>
      <Link className="primary-button" href="/booking">
        <span>Request a Booking</span>
        <small>Paid request, manually approved</small>
      </Link>
    </div>
  );
}

