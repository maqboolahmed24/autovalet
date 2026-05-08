import { PageIntro } from "../../../components/public/PageIntro";
import { PoliciesPageContent } from "../../../components/public/PoliciesPageContent";
import { JsonLdScript } from "../../../components/seo/JsonLd";
import { publicBreadcrumbs } from "../../../lib/seo/breadcrumbs";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";
import { createBreadcrumbJsonLd } from "../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("policies");

export default function PoliciesPage() {
  return (
    <>
      <JsonLdScript data={createBreadcrumbJsonLd(publicBreadcrumbs.policies)} />
      <PageIntro eyebrow="Policies" title="Clear terms for booking requests.">
        Review how deposits, cancellations, service areas, privacy and customer data are handled.
      </PageIntro>

      <PoliciesPageContent />
    </>
  );
}
