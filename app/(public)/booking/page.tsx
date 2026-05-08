import { BookingStepper } from "../../../components/booking/BookingStepper";
import { PageIntro } from "../../../components/public/PageIntro";
import { JsonLdScript } from "../../../components/seo/JsonLd";
import { publicBreadcrumbs } from "../../../lib/seo/breadcrumbs";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";
import { createBreadcrumbJsonLd } from "../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("booking");

export default function BookingPage() {
  return (
    <>
      <JsonLdScript data={createBreadcrumbJsonLd(publicBreadcrumbs.booking)} />
      <PageIntro eyebrow="Booking" title="Request your AUTO VALET booking." variant="compact">
        Choose your service, preferred time and details. A deposit is required before your request
        is sent for manual approval.
      </PageIntro>

      <BookingStepper />
    </>
  );
}
