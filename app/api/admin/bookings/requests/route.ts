import {
  adminRequestsInboxUsesMockData,
  getAdminRequestsInboxData,
  parseAdminRequestFilter,
} from "../../../../../lib/admin/requests";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, { permission: "view_bookings" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const url = new URL(request.url);
  const filter = parseAdminRequestFilter(url.searchParams.get("filter"));
  const search = url.searchParams.get("search")?.trim() || undefined;
  const data = await getAdminRequestsInboxData({ filter, search });

  return Response.json({
    success: true,
    data,
    message: adminRequestsInboxUsesMockData
      ? "Requests inbox data is placeholder until database persistence is connected."
      : undefined,
  });
}
