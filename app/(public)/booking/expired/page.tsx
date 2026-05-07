import { BookingOutcomeCard } from "../../../../components/booking/BookingOutcomeCard";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("bookingExpired");

export default function BookingExpiredPage() {
  return (
    <BookingOutcomeCard
      variant="expired"
      eyebrow="Hold expired"
      title="Booking hold expired."
      primaryAction={{
        href: "/booking",
        label: "Start again",
      }}
      secondaryAction={{
        href: "/services",
        label: "View services",
      }}
    >
      <p>Your temporary payment hold has expired, so the requested slot has been released.</p>
    </BookingOutcomeCard>
  );
}
