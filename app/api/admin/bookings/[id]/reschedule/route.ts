import { getAdminBookingDetail } from "../../../../../../lib/admin/booking-detail";
import { proposeReschedule } from "../../../../../../lib/admin/reschedule-booking";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(code: string, message: string, status: number, details: Record<string, unknown> = {}) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

function statusForRescheduleError(code: string) {
  switch (code) {
    case "ADMIN_AUTH_NOT_CONFIGURED":
    case "BOOKING_LOOKUP_NOT_CONFIGURED":
    case "RESCHEDULE_PERSISTENCE_NOT_CONFIGURED":
      return 501;
    case "ADMIN_PERMISSION_REQUIRED":
      return 403;
    case "RESCHEDULE_SLOT_UNAVAILABLE":
      return 409;
    case "RESCHEDULE_VALIDATION_FAILED":
      return 400;
    default:
      return 500;
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "reschedule_booking" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await request.json();
    body = parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const proposedDate = readString(body.proposedDate);
  const proposedStartTime = readString(body.proposedStartTime);

  if (!proposedDate || !proposedStartTime) {
    return errorResponse("INVALID_RESCHEDULE_TIME", "Choose a proposed date and time.", 400);
  }

  const params = await context.params;
  const booking = await getAdminBookingDetail(params.id);

  if (!booking) {
    return errorResponse("BOOKING_NOT_FOUND", "Booking was not found.", 404);
  }

  const result = await proposeReschedule(
    {
      bookingId: params.id,
      adminId: guard.session.adminId,
      proposedDate,
      proposedStartTime,
      message: readString(body.message),
    },
    {
      adminAuthenticated: true,
      canRescheduleBooking: true,
      persistenceConfigured: false,
      booking,
      existingBookings: [],
    },
  );

  if (!result.success) {
    return errorResponse(
      result.code,
      result.message,
      statusForRescheduleError(result.code),
      result.details,
    );
  }

  return Response.json({
    success: true,
    data: {
      bookingId: result.bookingId,
      status: result.status,
      proposedDate: result.proposedDate,
      proposedStartTime: result.proposedStartTime,
      customerActionUrl: result.customerActionUrl,
    },
    message: "Reschedule suggestion sent.",
  });
}
