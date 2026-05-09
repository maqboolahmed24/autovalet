import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

const footerLinks = [
  { href: "/services", label: "Services" },
  { href: "/booking", label: "Booking" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
];

const policyLinks = [
  { href: "/policies/privacy", label: "Privacy Policy" },
  { href: "/policies/terms", label: "Terms & Conditions" },
  { href: "/policies/cookies", label: "Cookie Policy" },
  { href: "/policies/data-requests", label: "Data Requests" },
];

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <BrandLogo variant="wordmark" />
          <p>Premium mobile detailing at your location.</p>
        </div>

        <nav className="public-footer__links" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="public-footer__note">
          <p>AUTO VALET operates within selected service areas.</p>
          <p>Bookings are reviewed before confirmation.</p>
        </div>

        <nav className="public-footer__policies" aria-label="Policy links">
          {policyLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
