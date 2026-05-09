import { notFound } from "next/navigation";
import { AdminDepositSettingsPage } from "../../../../components/admin/AdminDepositSettingsPage";
import { getPersistedDepositSettings } from "../../../../lib/admin/deposit-settings-persistence";
import { arePaymentsEnabled } from "../../../../lib/config/features";

export const metadata = {
  title: "Deposit Settings | AUTO VALET Admin",
  description: "AUTO VALET deposit settings and deposit preview.",
};

export const dynamic = "force-dynamic";

export default async function DepositSettingsPage() {
  if (!arePaymentsEnabled()) {
    notFound();
  }

  const settings = await getPersistedDepositSettings();

  return <AdminDepositSettingsPage settings={settings} />;
}
