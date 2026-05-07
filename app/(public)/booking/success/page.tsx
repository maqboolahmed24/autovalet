import { BookingOutcomeCard } from "../../../../components/booking/BookingOutcomeCard";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("bookingSuccess");

type BookingSuccessPageProps = {
  searchParams?: {
    reference?: string | string[];
  };
};

function getReference(searchParams: BookingSuccessPageProps["searchParams"]) {
  const reference = Array.isArray(searchParams?.reference)
    ? searchParams?.reference[0]
    : searchParams?.reference;

  return reference || "AV-2026-0000";
}

export default function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const reference = getReference(searchParams);

  return (
    <BookingOutcomeCard
      variant="success"
      eyebrow="Request received"
      title="Booking request received."
      primaryAction={{
        href: `/booking/status/${encodeURIComponent(reference)}`,
        label: "Check booking status",
      }}
      secondaryAction={{
        href: "/",
        label: "Back to home",
      }}
    >
      <p>Your deposit has been received and your booking request has been sent to AUTO VALET for review.</p>
      <div className="booking-outcome__notice">
        <strong>Your appointment is not confirmed yet.</strong>
        <p>AUTO VALET will review your location, vehicle details and requested time before approval.</p>
      </div>
    </BookingOutcomeCard>
  );
}
