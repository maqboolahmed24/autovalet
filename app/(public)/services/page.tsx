import { PageIntro } from "../../../components/public/PageIntro";
import { ServicesPageContent } from "../../../components/public/ServicesPageContent";
import { JsonLdScript } from "../../../components/seo/JsonLd";
import { publicBreadcrumbs } from "../../../lib/seo/breadcrumbs";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";
import { siteConfig } from "../../../lib/seo/site-config";
import { createBreadcrumbJsonLd, createServiceJsonLd } from "../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("services");

export default function ServicesPage() {
  return (
    <>
      <JsonLdScript data={[createServiceJsonLd(), createBreadcrumbJsonLd(publicBreadcrumbs.services)]} />
      <PageIntro eyebrow="Services" title="Mobile valeting services in Rochdale and Greater Manchester.">
        Choose a maintenance clean, deep clean or finishing extra for vehicles across
        {" "}
        {siteConfig.business.serviceAreaLabel}. Final price may vary depending on vehicle condition on arrival.
      </PageIntro>

      <ServicesPageContent />
    </>
  );
}
