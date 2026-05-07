import { ContactPageContent } from "../../../components/public/ContactPageContent";
import { PageIntro } from "../../../components/public/PageIntro";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("contact");

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Contact" title="Speak to AUTO VALET.">
        Questions about service areas, vehicle condition or multiple vehicles can be checked before
        requesting a booking.
      </PageIntro>

      <ContactPageContent />
    </>
  );
}
