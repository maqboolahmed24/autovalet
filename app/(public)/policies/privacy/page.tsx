import { PageIntro } from "../../../../components/public/PageIntro";
import { PolicyPageContent, type PolicySection } from "../../../../components/public/PolicyPageContent";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("privacy");

const privacySections: PolicySection[] = [
  {
    title: "Data collected",
    bullets: [
      "Name, phone number and email address.",
      "Service address, postcode and access notes.",
      "Vehicle details, selected services, extras and booking notes.",
      "Booking references, payment references, payment status and amounts.",
      "Marketing or photo consent choices where applicable.",
      "Private admin notes where needed for booking and service management.",
    ],
  },
  {
    title: "Why data is collected",
    paragraphs: [
      "AUTO VALET collects booking details to review requests, validate service areas, plan travel time, prepare for the selected service and communicate updates.",
      "Vehicle and condition notes help AUTO VALET review the booking request and explain any price changes before work begins.",
    ],
  },
  {
    title: "Payment handling",
    paragraphs: [
      "Card details are not stored directly by AUTO VALET. Deposit and payment processing should be handled by a secure payment provider.",
      "AUTO VALET may store payment references, status, deposit amount, remaining balance and refund or transfer notes so the booking can be managed correctly.",
    ],
  },
  {
    title: "Data sharing",
    paragraphs: [
      "Customer data may be shared with service providers needed to run the website, database, booking system, payment processing, email and SMS notifications.",
      "AUTO VALET should only share the details needed for those services to work.",
    ],
  },
  {
    title: "Analytics privacy",
    paragraphs: [
      "AUTO VALET analytics is disabled by default unless a privacy-safe provider is configured.",
      "Analytics events must not include full names, email addresses, phone numbers, full addresses, full postcodes, payment provider IDs, internal booking IDs, vehicle registrations or notes.",
    ],
  },
  {
    title: "Marketing and photo consent",
    paragraphs: [
      "AUTO VALET may ask for separate consent before using customer vehicle photos for marketing or gallery content.",
      "Future gallery images should avoid exposing registration plates, addresses or personal details.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "Booking and payment reference records may be retained for up to 6 years for operational, accounting, support and audit purposes.",
      "Notification logs, audit logs and gallery consent records should be retained only for the period needed for operational, legal or consent evidence.",
      "Data that is no longer needed should be deleted or anonymised according to the retention process configured for AUTO VALET.",
    ],
  },
  {
    title: "Customer rights",
    bullets: [
      "Customers can ask what personal data is held about them.",
      "Customers can ask for incorrect details to be corrected.",
      "Customers can ask for deletion where there is no valid operational, legal or accounting reason to retain the data.",
      "Customers can withdraw optional marketing or photo consent.",
    ],
  },
  {
    title: "Data requests",
    paragraphs: [
      "Customers can use the Data Requests page to ask for access, correction, deletion or marketing/photo consent withdrawal.",
      "Automatic handling is not enabled until AUTO VALET connects secure request storage or notification delivery.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Use the contact details shown on the Contact page once AUTO VALET has supplied the business phone number and email address.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageIntro eyebrow="Privacy Policy" title="How customer data is handled.">
        AUTO VALET collects the details needed to manage mobile detailing booking requests, payments,
        communication and consent.
      </PageIntro>

      <PolicyPageContent sections={privacySections} ctaText="A deposit is required before a booking request reaches review." />
    </>
  );
}
