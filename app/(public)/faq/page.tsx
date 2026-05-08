import { FaqPageContent, faqSchemaItems } from "../../../components/public/FaqPageContent";
import { PageIntro } from "../../../components/public/PageIntro";
import { JsonLdScript } from "../../../components/seo/JsonLd";
import { publicBreadcrumbs } from "../../../lib/seo/breadcrumbs";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";
import { createBreadcrumbJsonLd, createFaqPageJsonLd } from "../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("faq");

export default function FaqPage() {
  return (
    <>
      <JsonLdScript data={[createFaqPageJsonLd(faqSchemaItems), createBreadcrumbJsonLd(publicBreadcrumbs.faq)]} />
      <PageIntro eyebrow="FAQ" title="Questions before you request a booking.">
        Find answers about approval, pricing, service areas and mobile detailing access.
      </PageIntro>

      <FaqPageContent />
    </>
  );
}
