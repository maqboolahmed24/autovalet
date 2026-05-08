import { markNoShow } from "../../../../../../lib/admin/no-show";
import { requireAdmin, adminGuardErrorResponse } from "../../../../../../lib/auth/route-guards";
import type { NoShowReason } from "../../../../../../lib/policies";

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
  params: {
    id: string;
  };
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

function statusForNoShowError(code: string) {
  switch (code) {
    case "ADMIN_AUTH_NOT_CONFIGURED":
    case "BOOKING_LOOKUP_NOT_CONFIGURED":
    case "NO_SHOW_PERSISTENCE_NOT_CONFIGURED":
      return 501;
    case "ADMIN_PERMISSION_REQUIRED":
      return 403;
    case "NO_SHOW_STATUS_NOT_ALLOWED":
    case "NO_SHOW_TRANSITION_BLOCKED":
      return 409;
    case "NO_SHOW_VALIDATION_FAILED":
      return 400;
    default:
      return 500;
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isNoShowReason(value: unknown): value is NoShowReason {
  return (
    value === "customer_unavailable" ||
    value === "vehicle_inaccessible" ||
    value === "no_parking" ||
    value === "unsafe_location" ||
    value === "other"
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const guard = await requireAdmin(request, { permission: "mark_no_show" });

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

  if (!isNoShowReason(body.reason)) {
    return errorResponse("INVALID_NO_SHOW_REASON", "No-show reason is invalid.", 400);
  }

  const result = await markNoShow({
    bookingId: params.id,
    adminId: guard.session.adminId,
    reason: body.reason,
    notes: readString(body.notes),
  }, {
    adminAuthenticated: true,
    canMarkNoShow: true,
    persistenceConfigured: false,
  });

  if (!result.success) {
    return errorResponse(result.code, result.message, statusForNoShowError(result.code));
  }

  return jsonResponse({
    success: true,
    data: {
      bookingId: result.bookingId,
      status: result.status,
      depositAction: result.depositAction,
    },
    message: "No-show recorded.",
  });
}
