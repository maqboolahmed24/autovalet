import { AdminEmptyState } from "../../../../components/admin/AdminEmptyState";
import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";

export const metadata = {
  title: "Gallery | AUTO VALET Admin",
  description: "AUTO VALET admin gallery placeholder.",
};

export default function AdminGalleryPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Gallery"
        title="Gallery management"
        description="Approved before/after images and featured homepage content will be managed here."
      />
      <AdminEmptyState
        title="Gallery tools coming next"
        description="Marketing consent and image storage foundations will be connected before real uploads are enabled."
      />
    </div>
  );
}
