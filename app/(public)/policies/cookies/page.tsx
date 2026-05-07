import { PageIntro } from "../../../../components/public/PageIntro";
import { PolicyPageContent, type PolicySection } from "../../../../components/public/PolicyPageContent";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("cookies");

const cookieSections: PolicySection[] = [
  {
    title: "Current cookie use",
    paragraphs: [
      "If no analytics or tracking tools are enabled, AUTO VALET should only use essential cookies needed for site, session, security or booking functionality.",
      "Essential cookies help the website work and do not need to be used for advertising.",
    ],
  },
  {
    title: "Analytics later",
    paragraphs: [
      "If analytics, advertising pixels or other non-essential tracking are added later, this policy must be updated before those tools are enabled.",
      "Where required, customers should be given a clear choice before non-essential cookies are used.",
    ],
  },
  {
    title: "Managing cookies",
    paragraphs: [
      "Customers can manage cookies through their browser settings. Blocking essential cookies may affect booking, payment or status features.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Use the Contact page for cookie or privacy questions once AUTO VALET has supplied the business contact details.",
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <PageIntro eyebrow="Cookie Policy" title="Essential cookies only unless updated.">
        This policy explains current cookie use and what must happen before analytics or tracking
        cookies are added.
      </PageIntro>

      <PolicyPageContent sections={cookieSections} />
    </>
  );
}
