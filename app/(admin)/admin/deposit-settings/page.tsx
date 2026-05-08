import { notFound } from "next/navigation";
import { AdminDepositSettingsPage } from "../../../../components/admin/AdminDepositSettingsPage";
import { getDepositSettings } from "../../../../lib/admin/deposit-settings";
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

  const settings = await getDepositSettings();

  return <AdminDepositSettingsPage settings={settings} />;
}
