import { AdminGalleryPage } from "../../../../components/admin/AdminGalleryPage";
import { getAdminGalleryItems } from "../../../../lib/admin/gallery";

export const metadata = {
  title: "Gallery | AUTO VALET Admin",
  description: "Manage AUTO VALET approved before/after gallery items.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const data = await getAdminGalleryItems();

  return <AdminGalleryPage data={data} />;
}
