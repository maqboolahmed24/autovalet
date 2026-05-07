import { PageIntro } from "../../../../components/public/PageIntro";
import { PolicyPageContent, type PolicySection } from "../../../../components/public/PolicyPageContent";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("depositCancellation");

const depositCancellationSections: PolicySection[] = [
  {
    title: "Deposit required",
    paragraphs: [
      "A deposit is required to submit a booking request. The request does not reach AUTO VALET review until the deposit payment is completed.",
      "Payment of a deposit does not mean the appointment is approved.",
    ],
  },
  {
    title: "Request approval",
    paragraphs: [
      "AUTO VALET manually reviews every paid request before confirming, declining or offering a different time.",
      "If a request is declined by AUTO VALET, the deposit can be refunded or transferred according to the agreed route for that customer.",
    ],
  },
  {
    title: "Customer cancellation",
    paragraphs: [
      "Customers should contact AUTO VALET as soon as possible if they need to cancel or change a request.",
      "Refund or transfer options depend on the booking status, how close the cancellation is to the appointment and whether preparation or travel has already started.",
    ],
  },
  {
    title: "Late cancellation",
    paragraphs: [
      "Late cancellations may mean the deposit is retained or transferred only at AUTO VALET's discretion.",
      "Exact cancellation windows should be confirmed in the booking system or written policy before launch.",
    ],
  },
  {
    title: "No-show or access failure",
    paragraphs: [
      "If AUTO VALET arrives and the vehicle is not available, cannot be accessed, or suitable parking is not available, the deposit may be retained.",
      "This also applies where the supplied address, access details or parking information prevents the service from being completed.",
    ],
  },
  {
    title: "Weather or operational reschedule",
    paragraphs: [
      "AUTO VALET may reschedule due to weather, access issues, operational issues or unsuitable conditions.",
      "If AUTO VALET cannot fulfil the booking, the deposit can be refunded or transferred according to policy.",
    ],
  },
  {
    title: "Remaining balance",
    paragraphs: [
      "The remaining balance is tracked separately from the deposit and is paid on completion using the payment methods AUTO VALET accepts.",
      "AUTO VALET can adjust the final balance after inspecting vehicle condition and confirming any extra work required.",
    ],
  },
];

export default function DepositCancellationPage() {
  return (
    <>
      <PageIntro eyebrow="Deposit & Cancellation Policy" title="Deposit rules before approval.">
        A deposit is required to submit a request, but appointments are confirmed only after manual
        approval.
      </PageIntro>

      <PolicyPageContent sections={depositCancellationSections} />
    </>
  );
}
