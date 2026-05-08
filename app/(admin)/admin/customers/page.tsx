import { AdminEmptyState } from "../../../../components/admin/AdminEmptyState";
import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";

export const metadata = {
  title: "Customers | AUTO VALET Admin",
  description: "AUTO VALET admin customers placeholder.",
};

export default function AdminCustomersPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Customers"
        title="Customers"
        description="Customer records, vehicles and booking history will be managed here."
      />
      <AdminEmptyState
        title="Customer management coming next"
        description="The customer view will connect to booking records once database persistence is enabled."
      />
    </div>
  );
}
