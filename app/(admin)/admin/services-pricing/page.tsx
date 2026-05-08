import { AdminEmptyState } from "../../../../components/admin/AdminEmptyState";
import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";

export const metadata = {
  title: "Services & Pricing | AUTO VALET Admin",
  description: "AUTO VALET services and pricing setup placeholder.",
};

export default function ServicesPricingPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Services"
        title="Services & pricing"
        description="Packages, vehicle-size pricing, durations and add-ons will be managed here."
      />
      <AdminEmptyState
        title="Pricing controls coming next"
        description="The central catalogue exists. Admin editing will be added after persistence is connected."
      />
    </div>
  );
}
