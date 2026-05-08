import {
  getAdminAvailabilitySettings,
} from "../../../../lib/admin/availability";
import { adminGuardErrorResponse, requireAdmin } from "../../../../lib/auth/route-guards";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, { permission: "edit_availability" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const data = await getAdminAvailabilitySettings();

  return Response.json({
    success: true,
    data,
    message: data.isMockData
      ? "Availability settings are placeholder until database persistence is connected."
      : undefined,
  });
}
