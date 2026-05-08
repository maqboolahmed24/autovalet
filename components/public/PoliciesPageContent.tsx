import Link from "next/link";

type PolicyLink = {
  href: string;
  title: string;
  text: string;
};

const policyLinks: PolicyLink[] = [
  {
    href: "/policies/privacy",
    title: "Privacy Policy",
    text: "How customer, booking and vehicle data is handled.",
  },
  {
    href: "/policies/terms",
    title: "Terms & Conditions",
    text: "The booking request model, customer responsibilities and service limitations.",
  },
  {
    href: "/policies/deposit-cancellation",
    title: "Cancellation Policy",
    text: "Cancellation, no-show, review and reschedule rules.",
  },
  {
    href: "/policies/cookies",
    title: "Cookie Policy",
    text: "Essential cookie use now and how analytics cookies will be handled later.",
  },
  {
    href: "/policies/data-requests",
    title: "Data Requests",
    text: "Request access, correction, deletion or marketing/photo consent withdrawal.",
  },
  {
    href: "/contact",
    title: "Service Area Guidance",
    text: "Selected service zones, outside-zone requests and access or parking guidance.",
  },
];

export function PoliciesPageContent() {
  return (
    <section className="section public-info-page" aria-label="AUTO VALET policy pages">
      <div className="section__inner">
        <div className="public-info-page__grid motion-stagger">
          {policyLinks.map((link) => (
            <Link className="premium-card public-info-card policy-link-card" href={link.href} key={link.href}>
              <span className="eyebrow">Policy</span>
              <h2>{link.title}</h2>
              <p>{link.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
