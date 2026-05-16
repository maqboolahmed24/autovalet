import { Hero } from "../../components/public/Hero";
import { HowItWorks } from "../../components/public/HowItWorks";
import { ServiceAreaNotice } from "../../components/public/ServiceAreaNotice";
import { ServicesPreview } from "../../components/public/ServicesPreview";
import { TrustStrip } from "../../components/public/TrustStrip";
import { WorkStory } from "../../components/public/WorkStory";
import { JsonLdScript } from "../../components/seo/JsonLd";
import { createPublicMetadata } from "../../lib/seo/public-metadata";
import { createLocalBusinessJsonLd } from "../../lib/seo/structured-data";

export const metadata = createPublicMetadata("home");

export default function HomePage() {
  return (
    <>
      <JsonLdScript data={createLocalBusinessJsonLd()} />
      <Hero />
      <TrustStrip />
      <ServicesPreview />
      <WorkStory />
      <HowItWorks />
      <ServiceAreaNotice />
    </>
  );
}
