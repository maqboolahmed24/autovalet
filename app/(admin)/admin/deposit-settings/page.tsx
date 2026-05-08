import { AdminEmptyState } from "../../../../components/admin/AdminEmptyState";
import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";

export const metadata = {
  title: "Deposit Settings | AUTO VALET Admin",
  description: "AUTO VALET deposit settings placeholder.",
};

export default function DepositSettingsPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Deposit"
        title="Deposit settings"
        description="Deposit amount, transfer policy and payment handling rules will be managed here."
      />
      <AdminEmptyState
        title="Deposit controls coming next"
        description="The current foundation uses a fixed deposit estimate until admin-managed settings are connected."
      />
    </div>
  );
}
