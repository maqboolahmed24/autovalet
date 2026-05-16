import { ContactPageContent } from "../../../components/public/ContactPageContent";
import { PageIntro } from "../../../components/public/PageIntro";
import { JsonLdScript } from "../../../components/seo/JsonLd";
import { publicBreadcrumbs } from "../../../lib/seo/breadcrumbs";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";
import { createBreadcrumbJsonLd } from "../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("contact");

export default function ContactPage() {
  return (
    <>
      <JsonLdScript data={createBreadcrumbJsonLd(publicBreadcrumbs.contact)} />
      <PageIntro eyebrow="Contact" title="Speak to AUTO VALET." className="contact-page-intro" variant="compact">
        Questions about service areas, vehicle condition or multiple vehicles can be checked before
        requesting a booking.
      </PageIntro>

      <ContactPageContent />
    </>
  );
}
