import { AdminDataRequestsPage } from "../../../../components/admin/AdminDataRequestsPage";
import { getAdminDataRequests } from "../../../../lib/admin/data-requests";

export const metadata = {
  title: "Data Requests | AUTO VALET Admin",
  description: "AUTO VALET admin privacy and customer data requests.",
};

export const dynamic = "force-dynamic";

export default async function DataRequestsAdminPage() {
  const data = await getAdminDataRequests();

  return <AdminDataRequestsPage data={data} />;
}
