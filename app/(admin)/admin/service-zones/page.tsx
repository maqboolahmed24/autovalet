import { AdminEmptyState } from "../../../../components/admin/AdminEmptyState";
import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";

export const metadata = {
  title: "Service Zones | AUTO VALET Admin",
  description: "AUTO VALET service zone setup placeholder.",
};

export default function ServiceZonesPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Service zones"
        title="Service zone setup"
        description="Approved postcodes, districts and regional rules will be managed here."
      />
      <AdminEmptyState
        title="Service-zone management coming next"
        description="The validation engine exists with placeholder zones. Admin-managed zones will replace them later."
      />
    </div>
  );
}
