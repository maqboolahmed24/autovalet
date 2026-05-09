"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrandLogo } from "./BrandLogo";

export type PublicNavLink = {
  href: string;
  label: string;
};

type MobileMenuProps = {
  isOpen: boolean;
  links: PublicNavLink[];
  onClose: () => void;
};

export function MobileMenu({ isOpen, links, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Public navigation">
      <div className="mobile-menu__panel motion-sheet-enter">
        <div className="mobile-menu__top">
          <BrandLogo className="mobile-menu__brand" onClick={onClose} />
          <button className="mobile-menu__close" type="button" onClick={onClose} aria-label="Close menu">
            Close
          </button>
        </div>

        <nav className="mobile-menu__nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={onClose}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mobile-menu__cta">
          <Link className="primary-button" href="/booking" onClick={onClose}>
            Request a Booking
          </Link>
          <p>Requests are reviewed before approval.</p>
        </div>
      </div>
    </div>
  );
}
