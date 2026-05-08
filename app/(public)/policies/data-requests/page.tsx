import { DataRequestForm } from "../../../../components/public/DataRequestForm";
import { PageIntro } from "../../../../components/public/PageIntro";
import { JsonLdScript } from "../../../../components/seo/JsonLd";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";
import { createBreadcrumbJsonLd } from "../../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("dataRequests");

export default function DataRequestsPage() {
  return (
    <>
      <JsonLdScript
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Policies", path: "/policies" },
          { name: "Data Requests", path: "/policies/data-requests" },
        ])}
      />
      <PageIntro eyebrow="Data Requests" title="Request access, correction or deletion.">
        Customers can ask about personal data held for booking, service management, payment
        references and marketing/photo consent.
      </PageIntro>

      <section className="section public-info-page" aria-label="Data request form">
        <div className="section__inner public-info-page__narrow">
          <DataRequestForm />
        </div>
      </section>
    </>
  );
}
