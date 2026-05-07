import { Hero } from "../../components/public/Hero";
import { HowItWorks } from "../../components/public/HowItWorks";
import { PricingPreview } from "../../components/public/PricingPreview";
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
    </>
  );
}
