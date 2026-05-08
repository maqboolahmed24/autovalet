import {
  declineBooking,
  isDeclineReason,
} from "../../../../../../lib/admin/decline-booking";
import { getAdminBookingDetail } from "../../../../../../lib/admin/booking-detail";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../../lib/auth/route-guards";
import { isDatabaseConfigured } from "../../../../../../lib/db/postgres";
import { isDepositAction } from "../../../../../../lib/policies";

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

function statusForDeclineError(code: string) {
  switch (code) {
    case "ADMIN_AUTH_NOT_CONFIGURED":
    case "BOOKING_LOOKUP_NOT_CONFIGURED":
    case "DECLINE_PERSISTENCE_NOT_CONFIGURED":
      return 501;
    case "ADMIN_PERMISSION_REQUIRED":
      return 403;
    case "DECLINE_TRANSITION_BLOCKED":
      return 409;
    case "DECLINE_BOOKING_VALIDATION_FAILED":
      return 400;
    default:
      return 500;
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "decline_booking" });

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

  if (!isDeclineReason(body.reason)) {
    return errorResponse("INVALID_DECLINE_REASON", "Choose a valid decline reason.", 400);
  }

  if (!isDepositAction(body.depositAction)) {
    return errorResponse("INVALID_DEPOSIT_ACTION", "Choose a valid deposit action.", 400);
  }

  const params = await context.params;
  const booking = await getAdminBookingDetail(params.id);

  if (!booking) {
    return errorResponse("BOOKING_NOT_FOUND", "Booking was not found.", 404);
  }

  const result = await declineBooking(
    {
      bookingId: params.id,
      adminId: guard.session.adminId,
      reason: body.reason,
      depositAction: body.depositAction,
      notes: readString(body.notes),
    },
    {
      adminAuthenticated: true,
      canDeclineBooking: true,
      persistenceConfigured: isDatabaseConfigured(),
      booking,
    },
  );

  if (!result.success) {
    return errorResponse(
      result.code,
      result.message,
      statusForDeclineError(result.code),
      result.details,
    );
  }

  return Response.json({
    success: true,
    data: {
      bookingId: result.bookingId,
      status: result.status,
      depositAction: result.depositAction,
    },
    message: "Booking request declined.",
  });
}
