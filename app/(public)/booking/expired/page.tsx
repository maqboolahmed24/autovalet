import { BookingOutcomeCard } from "../../../../components/booking/BookingOutcomeCard";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("bookingExpired");

export default function BookingExpiredPage() {
  return (
    <BookingOutcomeCard
      variant="expired"
      eyebrow="Request expired"
      title="Booking request expired."
      primaryAction={{
        href: "/booking",
        label: "Start again",
      }}
      secondaryAction={{
        href: "/services",
        label: "View services",
      }}
    >
      <p>The requested slot is no longer held. Please choose another time.</p>
    </BookingOutcomeCard>
  );
}
