import { PageIntro } from "../../../../components/public/PageIntro";
import { PolicyPageContent, type PolicySection } from "../../../../components/public/PolicyPageContent";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";
import { siteConfig } from "../../../../lib/seo/site-config";

export const metadata = createPublicMetadata("terms");

const termsSections: PolicySection[] = [
  {
    title: "Booking request model",
    paragraphs: [
      "AUTO VALET does not offer instantly confirmed appointments. Customers submit a booking request before the request reaches review.",
      "A requested slot is not an approved appointment until AUTO VALET manually accepts it.",
    ],
  },
  {
    title: "Manual approval",
    paragraphs: [
      "AUTO VALET reviews location, vehicle details, selected service, access, travel time and operating conditions before confirming a request.",
      "AUTO VALET may approve, decline or offer a different time where the requested slot cannot be completed safely or reliably.",
    ],
  },
  {
    title: "Customer responsibilities",
    bullets: [
      "Provide accurate contact, address, postcode and vehicle details.",
      "Choose the closest vehicle size and selected service honestly.",
      "Make sure the vehicle is accessible at the agreed location.",
      "Make sure suitable parking is available nearby.",
      "Share any heavy condition, pet hair, access or safety information before approval where possible.",
    ],
  },
  {
    title: "Access and parking",
    paragraphs: [
      "AUTO VALET is a mobile detailing service, so suitable access and parking are required. If the vehicle cannot be accessed or parking is unsuitable, the job may need to be rescheduled, declined or treated as an access failure under the cancellation policy.",
    ],
  },
  {
    title: "Condition-based pricing",
    paragraphs: [
      "Prices may vary depending on vehicle condition on arrival, selected extras, access and work required.",
      "AUTO VALET can adjust the final price after inspecting the vehicle and explaining the reason for the change.",
    ],
  },
  {
    title: "Service area limits",
    paragraphs: [
      `AUTO VALET operates within ${siteConfig.business.operatingRegion}.`,
      "Outside-zone requests may be considered for 3+ vehicles at the same address, but they are not guaranteed to be accepted.",
    ],
  },
  {
    title: "Weather and rescheduling",
    paragraphs: [
      "AUTO VALET may reschedule due to weather, access issues, operational issues or unsuitable conditions.",
      "If AUTO VALET cannot fulfil an approved booking, AUTO VALET will contact the customer to agree the next step.",
    ],
  },
  {
    title: "Plain limitation note",
    paragraphs: [
      "AUTO VALET aims to complete work carefully and professionally. The final result can depend on vehicle age, material condition, previous damage, staining and contamination.",
      "Customers should tell AUTO VALET about known defects, leaks, unsafe access, delicate materials or electrical issues before the work begins.",
      "Auto Valet Detailing accepts no responsibility for any loss or damage caused during or after the completion of this service.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageIntro eyebrow="Terms & Conditions" title="Plain terms for booking requests.">
        These terms explain how AUTO VALET reviews booking requests, confirms appointments and
        manages customer responsibilities.
      </PageIntro>

      <PolicyPageContent sections={termsSections} />
    </>
  );
}
