import { FaqPageContent } from "../../../components/public/FaqPageContent";
import { PageIntro } from "../../../components/public/PageIntro";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("faq");

export default function FaqPage() {
  return (
    <>
      <PageIntro eyebrow="FAQ" title="Questions before you request a booking.">
        Find answers about deposits, approval, pricing, service areas and mobile detailing access.
      </PageIntro>

      <FaqPageContent />
    </>
  );
}
