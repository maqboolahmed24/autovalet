import { PageIntro } from "../../../../components/public/PageIntro";
import { PolicyPageContent, type PolicySection } from "../../../../components/public/PolicyPageContent";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("depositCancellation");

const cancellationSections: PolicySection[] = [
  {
    title: "No online payment at request",
    paragraphs: [
      "No online payment is taken when a customer submits a booking request.",
      "A submitted request does not mean the appointment is approved.",
    ],
  },
  {
    title: "Request approval",
    paragraphs: [
      "AUTO VALET manually reviews every request before confirming, declining or offering a different time.",
      "If a request is declined by AUTO VALET, no online payment action is needed.",
    ],
  },
  {
    title: "Customer cancellation",
    paragraphs: [
      "Customers should contact AUTO VALET as soon as possible if they need to cancel or change a request.",
      "Cancellation options depend on the booking status, how close the cancellation is to the appointment and whether preparation or travel has already started.",
    ],
  },
  {
    title: "Late cancellation",
    paragraphs: [
      "Late cancellations may affect whether AUTO VALET can offer another appointment time.",
      "Exact cancellation windows should be confirmed in the booking system or written policy before launch.",
    ],
  },
  {
    title: "No-show or access failure",
    paragraphs: [
      "If AUTO VALET arrives and the vehicle is not available, cannot be accessed, or suitable parking is not available, the visit may be treated as a no-show or access failure.",
      "This also applies where the supplied address, access details or parking information prevents the service from being completed.",
    ],
  },
  {
    title: "Weather or operational reschedule",
    paragraphs: [
      "AUTO VALET may reschedule due to weather, access issues, operational issues or unsuitable conditions.",
      "If AUTO VALET cannot fulfil the booking, AUTO VALET will contact the customer to agree a suitable next step.",
    ],
  },
  {
    title: "Payment on completion",
    paragraphs: [
      "Payment is arranged after approval and paid on completion using the methods AUTO VALET accepts.",
      "AUTO VALET can adjust the final price after inspecting vehicle condition and confirming any extra work required.",
    ],
  },
];

export default function DepositCancellationPage() {
  return (
    <>
      <PageIntro eyebrow="Cancellation Policy" title="Cancellation rules before and after approval.">
        No online payment is taken when a request is submitted. Appointments are confirmed only
        after manual approval.
      </PageIntro>

      <PolicyPageContent sections={cancellationSections} />
    </>
  );
}
