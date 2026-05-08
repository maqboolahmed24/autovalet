import {
  adminBookingDetailUsesMockData,
  getAdminBookingDetail,
} from "../../../../../lib/admin/booking-detail";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

type BookingDetailRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: BookingDetailRouteContext) {
  const guard = await requireAdmin(request, { permission: "view_bookings" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const params = await context.params;
  const data = await getAdminBookingDetail(params.id);

  if (!data) {
    return Response.json(
      {
        success: false,
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Booking was not found.",
          details: {},
        },
      },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    data,
    message: adminBookingDetailUsesMockData
      ? "Booking detail data is placeholder until database persistence is connected."
      : undefined,
  });
}
