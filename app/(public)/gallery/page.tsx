import { GalleryPageContent } from "../../../components/public/GalleryPageContent";
import { JsonLdScript } from "../../../components/seo/JsonLd";
import { getPublicGalleryItems } from "../../../lib/gallery/public-gallery";
import { publicBreadcrumbs } from "../../../lib/seo/breadcrumbs";
import { createPublicMetadata } from "../../../lib/seo/public-metadata";
import { createBreadcrumbJsonLd } from "../../../lib/seo/structured-data";

export const metadata = createPublicMetadata("gallery");
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getPublicGalleryItems();

  return (
    <>
      <JsonLdScript data={createBreadcrumbJsonLd(publicBreadcrumbs.gallery)} />
      <GalleryPageContent items={items} />
    </>
  );
}
