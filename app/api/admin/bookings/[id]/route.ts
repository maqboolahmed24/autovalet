import {
  adminBookingDetailUsesMockData,
  getAdminBookingDetail,
} from "../../../../../lib/admin/booking-detail";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

type BookingDetailRouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function GET(request: Request, context: BookingDetailRouteContext) {
  const guard = await requireAdmin(request, { permission: "view_bookings" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const params = await context.params;
  const data = await getAdminBookingDetail(params.id);

  return Response.json({
    success: true,
    data,
    message: adminBookingDetailUsesMockData
      ? "Booking detail data is placeholder until database persistence is connected."
      : undefined,
  });
}
