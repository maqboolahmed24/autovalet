import {
  adminCalendarUsesMockData,
  getAdminCalendarDay,
  parseAdminCalendarDate,
} from "../../../../lib/admin/calendar";
import { adminGuardErrorResponse, requireAdmin } from "../../../../lib/auth/route-guards";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, { permission: "view_bookings" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const url = new URL(request.url);
  const date = parseAdminCalendarDate(url.searchParams.get("date"));
  const data = await getAdminCalendarDay({ date });

  return Response.json({
    success: true,
    data,
    message: adminCalendarUsesMockData
      ? "Calendar timeline data is placeholder until database persistence is connected."
      : undefined,
  });
}
