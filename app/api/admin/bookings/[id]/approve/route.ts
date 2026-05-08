import { approveBooking } from "../../../../../../lib/admin/approve-booking";
import { getAdminBookingDetail } from "../../../../../../lib/admin/booking-detail";
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

function statusForApproveError(code: string) {
  switch (code) {
    case "ADMIN_AUTH_NOT_CONFIGURED":
    case "BOOKING_LOOKUP_NOT_CONFIGURED":
    case "APPROVAL_PERSISTENCE_NOT_CONFIGURED":
      return 501;
    case "ADMIN_PERMISSION_REQUIRED":
      return 403;
    case "APPROVAL_CONFLICT":
    case "APPROVAL_VALIDATION_FAILED":
      return 409;
    case "APPROVE_BOOKING_VALIDATION_FAILED":
      return 400;
    default:
      return 500;
  }
}

async function readJsonObject(request: Request) {
  const text = await request.text();

  if (!text.trim()) {
    return {};
  }

  const parsed = JSON.parse(text) as unknown;

  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : null;
}

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "approve_booking" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  try {
    const body = await readJsonObject(request);

    if (body === null) {
      return errorResponse("INVALID_JSON", "Request body must be a JSON object.", 400);
    }
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const params = await context.params;
  const booking = await getAdminBookingDetail(params.id);

  if (!booking) {
    return errorResponse("BOOKING_NOT_FOUND", "Booking was not found.", 404);
  }

  const result = await approveBooking(
    {
      bookingId: params.id,
      adminId: guard.session.adminId,
    },
    {
      adminAuthenticated: true,
      canApproveBooking: true,
      persistenceConfigured: false,
      booking,
      existingBookings: [],
    },
  );

  if (!result.success) {
    return errorResponse(
      result.code,
      result.message,
      statusForApproveError(result.code),
      result.details,
    );
  }

  return Response.json({
    success: true,
    data: {
      bookingId: result.bookingId,
      status: result.status,
      approvedAt: result.approvedAt,
    },
    message: "Booking approved.",
  });
}
