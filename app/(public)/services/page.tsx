import { PageIntro } from "../../../components/public/PageIntro";
import { ServicesPageContent } from "../../../components/public/ServicesPageContent";
import { JsonLdScript } from "../../../components/seo/JsonLd";
import { publicBreadcrumbs } from "../../../lib/seo/breadcrumbs";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";
import { createBreadcrumbJsonLd, createServiceJsonLd } from "../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("services");

export default function ServicesPage() {
  return (
    <>
      <JsonLdScript data={[createServiceJsonLd(), createBreadcrumbJsonLd(publicBreadcrumbs.services)]} />
      <PageIntro eyebrow="Services" title="Mobile detailing packages with clear pricing.">
        Choose the level of care, add any finishing extras, and request your preferred slot. Final
        price may vary depending on vehicle condition on arrival.
      </PageIntro>

      <ServicesPageContent />
    </>
  );
}
