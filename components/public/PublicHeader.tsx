"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileMenu, type PublicNavLink } from "./MobileMenu";

const publicNavLinks: PublicNavLink[] = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

export function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 24);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  return (
    <>
      <header className={`public-header${isScrolled ? " is-scrolled" : ""}`}>
        <div className="public-header__inner">
          <Link className="public-header__brand" href="/" aria-label="AUTO VALET home">
            AUTO VALET
          </Link>

          <nav className="public-header__nav" aria-label="Primary navigation">
            {publicNavLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link className="public-header__booking" href="/booking">
              Request a Booking
            </Link>
          </nav>

          <button
            className="public-header__menu"
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>

      <MobileMenu isOpen={isMenuOpen} links={publicNavLinks} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

