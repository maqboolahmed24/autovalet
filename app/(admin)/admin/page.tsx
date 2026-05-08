import { AdminTodayDashboard } from "../../../components/admin/AdminTodayDashboard";
import { getAdminDashboardData } from "../../../lib/admin/dashboard";

export const metadata = {
  title: "Today | AUTO VALET Admin",
  description: "AUTO VALET admin dashboard for requests, jobs and quick actions.",
};

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return <AdminTodayDashboard data={data} />;
}
