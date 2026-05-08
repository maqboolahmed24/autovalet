import { getAdminDashboardData } from "../../../../lib/admin/dashboard";
import { requireAdmin, adminGuardErrorResponse } from "../../../../lib/auth/route-guards";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, { permission: "view_dashboard" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const data = await getAdminDashboardData();

  return Response.json({
    success: true,
    data,
    message: data.isMockData
      ? "Dashboard data is placeholder until database persistence is connected."
      : undefined,
  });
}
