import { AdminDepositSettingsPage } from "../../../../components/admin/AdminDepositSettingsPage";
import { getDepositSettings } from "../../../../lib/admin/deposit-settings";

export const metadata = {
  title: "Deposit Settings | AUTO VALET Admin",
  description: "AUTO VALET deposit settings and deposit preview.",
};

export default async function DepositSettingsPage() {
  const settings = await getDepositSettings();

  return <AdminDepositSettingsPage settings={settings} />;
}
