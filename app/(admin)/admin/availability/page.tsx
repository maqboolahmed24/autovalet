import { AdminAvailabilityPage } from "../../../../components/admin/AdminAvailabilityPage";
import { getAdminAvailabilitySettings } from "../../../../lib/admin/availability";

export const metadata = {
  title: "Availability | AUTO VALET Admin",
  description: "AUTO VALET admin controls for working hours, closed days and blocked time.",
};

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const data = await getAdminAvailabilitySettings();

  return <AdminAvailabilityPage data={data} />;
}
