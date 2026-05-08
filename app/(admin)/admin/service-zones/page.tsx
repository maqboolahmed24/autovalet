import { AdminServiceZonesPage } from "../../../../components/admin/AdminServiceZonesPage";
import { getAdminServiceZones } from "../../../../lib/admin/service-zones";

export const metadata = {
  title: "Service Zones | AUTO VALET Admin",
  description: "AUTO VALET service zone management for postcodes, districts and regions.",
};

export default async function ServiceZonesPage() {
  const data = await getAdminServiceZones();

  return <AdminServiceZonesPage data={data} />;
}
