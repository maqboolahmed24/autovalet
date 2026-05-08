import { getAdminServicesPricing } from "../../../../lib/admin/services-pricing";
import { adminGuardErrorResponse, requireAdmin } from "../../../../lib/auth/route-guards";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, { permission: "edit_services_pricing" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const data = await getAdminServicesPricing();

  return Response.json({
    success: true,
    data: {
      addons: data.addons,
      isMockData: data.isMockData,
    },
    message: data.isMockData
      ? "Add-ons are current configured defaults until database persistence is connected."
      : undefined,
  });
}
