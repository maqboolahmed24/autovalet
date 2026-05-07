import { BookingStepper } from "../../../components/booking/BookingStepper";
import { PageIntro } from "../../../components/public/PageIntro";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("booking");

export default function BookingPage() {
  return (
    <>
      <PageIntro eyebrow="Booking" title="Request your AUTO VALET booking.">
        Choose your service, preferred time and details. A deposit is required before your request
        is sent for manual approval.
      </PageIntro>

      <BookingStepper />
    </>
  );
}
