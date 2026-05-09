import { cancelBooking } from "../../../../../../lib/admin/cancel-booking";
import { getAdminBookingDetail } from "../../../../../../lib/admin/booking-detail";
import { requireAdmin, adminGuardErrorResponse } from "../../../../../../lib/auth/route-guards";
import { isDatabaseConfigured } from "../../../../../../lib/db/postgres";
import type { CancellationActor, CancellationReason, DepositAction } from "../../../../../../lib/policies";
import { isDepositAction } from "../../../../../../lib/policies";

export const runtime = "nodejs";

type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  message?: string;
};

type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function jsonResponse<TData>(body: ApiSuccessResponse<TData> | ApiErrorResponse, status = 200) {
  return Response.json(body, { status });
}

function errorResponse(code: string, message: string, status: number, details: Record<string, unknown> = {}) {
  return jsonResponse(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    status,
  );
}

function statusForCancellationError(code: string) {
  switch (code) {
    case "ADMIN_AUTH_NOT_CONFIGURED":
    case "BOOKING_LOOKUP_NOT_CONFIGURED":
    case "CANCELLATION_PERSISTENCE_NOT_CONFIGURED":
      return 501;
    case "BOOKING_NOT_FOUND":
      return 404;
    case "ADMIN_PERMISSION_REQUIRED":
      return 403;
    case "CANCELLATION_POLICY_BLOCKED":
    case "CANCELLATION_TRANSITION_BLOCKED":
    case "DEPOSIT_ACTION_NOT_ALLOWED":
      return 409;
    case "CANCELLATION_VALIDATION_FAILED":
      return 400;
    default:
      return 500;
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isCancellationActor(value: unknown): value is CancellationActor {
  return value === "customer" || value === "admin" || value === "system";
}

function isCancellationReason(value: unknown): value is CancellationReason {
  return (
    value === "customer_requested" ||
    value === "weather" ||
    value === "outside_service_area" ||
    value === "vehicle_unsuitable" ||
    value === "access_or_parking_issue" ||
    value === "admin_operational_issue" ||
    value === "duplicate_booking" ||
    value === "payment_issue" ||
    value === "other"
  );
}

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "cancel_booking" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  let body: Record<string, unknown>;

  try {
    const parsedBody = await request.json();
    body = parsedBody && typeof parsedBody === "object" && !Array.isArray(parsedBody)
      ? (parsedBody as Record<string, unknown>)
      : {};
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  if (!isCancellationActor(body.actor)) {
    return errorResponse("INVALID_CANCELLATION_ACTOR", "Cancellation source is invalid.", 400);
  }

  if (!isCancellationReason(body.reason)) {
    return errorResponse("INVALID_CANCELLATION_REASON", "Cancellation reason is invalid.", 400);
  }

  const depositAction: DepositAction | undefined = isDepositAction(body.depositAction)
    ? body.depositAction
    : undefined;

  const params = await context.params;
  const booking = await getAdminBookingDetail(params.id);

  if (!booking) {
    return errorResponse("BOOKING_NOT_FOUND", "Booking was not found.", 404);
  }

  const result = await cancelBooking({
    bookingId: params.id,
    adminId: guard.session.adminId,
    actor: body.actor,
    reason: body.reason,
    depositAction,
    notes: readString(body.notes),
  }, {
    adminAuthenticated: true,
    canCancelBooking: true,
    persistenceConfigured: isDatabaseConfigured(),
    booking: {
      id: booking.id,
      status: booking.status,
      appointmentStartAt: booking.schedule.requestedStartAt,
      depositPaidMinor: booking.financials.depositPaidMinor,
    },
  });

  if (!result.success) {
    return errorResponse(result.code, result.message, statusForCancellationError(result.code));
  }

  return jsonResponse({
    success: true,
    data: {
      bookingId: result.bookingId,
      status: result.status,
      depositAction: result.depositAction,
    },
    message: "Booking cancellation recorded.",
  });
}
