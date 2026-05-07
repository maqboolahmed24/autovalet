import { AddonsPreview } from "../../components/public/AddonsPreview";
import { FinalCta } from "../../components/public/FinalCta";
import { Hero } from "../../components/public/Hero";
import { HowItWorks } from "../../components/public/HowItWorks";
import { PricingPreview } from "../../components/public/PricingPreview";
import { ServiceAreaNotice } from "../../components/public/ServiceAreaNotice";
import { ServicesPreview } from "../../components/public/ServicesPreview";
import { TrustStrip } from "../../components/public/TrustStrip";
import { WorkStory } from "../../components/public/WorkStory";
import { createPublicMetadata } from "../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("home");

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ServicesPreview />
      <WorkStory />
      <HowItWorks />
      <PricingPreview />
      <AddonsPreview />
      <ServiceAreaNotice />
      <FinalCta />
    </>
  );
}
