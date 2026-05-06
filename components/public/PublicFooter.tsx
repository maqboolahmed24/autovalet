import Link from "next/link";

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
  { href: "/policies/deposit-cancellation", label: "Deposit & Cancellation Policy" },
  { href: "/policies/cookies", label: "Cookie Policy" },
];

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <Link href="/">AUTO VALET</Link>
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
          <p>Deposit required. Bookings are confirmed after manual approval.</p>
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

