import { PageIntro } from "../../../components/public/PageIntro";
import { PoliciesPageContent } from "../../../components/public/PoliciesPageContent";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("policies");

export default function PoliciesPage() {
  return (
    <>
      <PageIntro eyebrow="Policies" title="Clear terms for booking requests.">
        Review how deposits, cancellations, service areas, privacy and customer data are handled.
      </PageIntro>

      <PoliciesPageContent />
    </>
  );
}
