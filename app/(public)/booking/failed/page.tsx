import { BookingOutcomeCard } from "../../../../components/booking/BookingOutcomeCard";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("paymentFailed");

export default function BookingFailedPage() {
  return (
    <BookingOutcomeCard
      variant="failed"
      eyebrow="Request failed"
      title="Booking request could not be submitted."
      primaryAction={{
        href: "/booking",
        label: "Try again",
      }}
      secondaryAction={{
        href: "/services",
        label: "Back to services",
      }}
    >
      <p>No booking request has been submitted. You can return to the booking form and choose a requested time again.</p>
    </BookingOutcomeCard>
  );
}
