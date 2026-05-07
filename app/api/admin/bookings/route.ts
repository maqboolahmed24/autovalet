import {
  createManualBooking,
  parseCreateManualBookingInput,
} from "../../../../lib/admin/manual-booking";

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

function statusForManualBookingError(code: string) {
  switch (code) {
    case "ADMIN_AUTH_NOT_CONFIGURED":
    case "MANUAL_BOOKING_PERSISTENCE_NOT_CONFIGURED":
      return 501;
    case "ADMIN_PERMISSION_REQUIRED":
      return 403;
    case "SLOT_UNAVAILABLE":
      return 409;
    case "MANUAL_BOOKING_VALIDATION_FAILED":
    case "OUTSIDE_SERVICE_AREA":
    case "MANUAL_BOOKING_PREVIEW_FAILED":
      return 400;
    default:
      return 500;
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const parsed = parseCreateManualBookingInput(body);

  if (!parsed.input) {
    return errorResponse("INVALID_MANUAL_BOOKING", "Manual booking details are required.", 400, {
      errors: parsed.errors,
    });
  }

  if (parsed.errors.length > 0) {
    return errorResponse("INVALID_MANUAL_BOOKING", "Check the manual booking details.", 400, {
      errors: parsed.errors,
    });
  }

  // TODO: Replace this safe placeholder with session authentication and `create_manual_booking` permission checks.
  const result = await createManualBooking(parsed.input, {
    adminAuthenticated: false,
    canCreateManualBooking: false,
    persistenceConfigured: false,
    existingBookings: [],
  });

  if (!result.success) {
    return errorResponse(result.code, result.message, statusForManualBookingError(result.code), result.details);
  }

  return jsonResponse(
    {
      success: true,
      data: {
        bookingReference: result.bookingReference,
        status: result.status,
      },
      message: "Manual booking created.",
    },
    201,
  );
}
