import { GalleryPageContent } from "../../../components/public/GalleryPageContent";
import { PageIntro } from "../../../components/public/PageIntro";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("gallery");

export default function GalleryPage() {
  return (
    <>
      <PageIntro eyebrow="Gallery" title="Recent work, built for before and after results.">
        Real customer images will be added as completed work is approved for the gallery. Until
        then, these placeholders show where exterior, interior and deep clean results will live.
      </PageIntro>

      <GalleryPageContent />
    </>
  );
}
