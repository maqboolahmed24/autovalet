import { PageIntro } from "../../../components/public/PageIntro";
import { ServiceAreaPageContent } from "../../../components/public/ServiceAreaPageContent";
import { JsonLdScript } from "../../../components/seo/JsonLd";
import { publicBreadcrumbs } from "../../../lib/seo/breadcrumbs";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";
import { createBreadcrumbJsonLd } from "../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("serviceArea");

export default function ServiceAreaPage() {
  return (
    <>
      <JsonLdScript data={createBreadcrumbJsonLd(publicBreadcrumbs.serviceArea)} />
      <PageIntro eyebrow="Service areas" title="Mobile car detailing in Greater Manchester.">
        AUTO VALET covers Rochdale and the core Greater Manchester area, with nearby
        locations reviewed before confirmation.
      </PageIntro>

      <ServiceAreaPageContent />
    </>
  );
}
