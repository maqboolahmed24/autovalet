import { isRequestedSlotStillAvailable } from "../../../lib/booking/holds";
import { createBookingReference } from "../../../lib/booking/references";
import {
  createBookingRequestSnapshot,
  validateBookingDraftForRequest,
} from "../../../lib/booking/requests";
import { mapZoneValidationToDraftStatus, parseBookingDraft } from "../../../lib/booking/draft-parser";
import {
  createBookingRequestRecord,
  getBookingRequestByIdempotencyKey,
  getBlockingBookingRecords,
  SlotUnavailableError,
} from "../../../lib/db/booking-repository";
import { isDatabaseConfigured } from "../../../lib/db/postgres";
import { isValidIdempotencyKey, normalizeIdempotencyKey } from "../../../lib/payments/idempotency";
import { validateServiceZone, ZoneValidationError } from "../../../lib/zones";
import type { ZoneStatus } from "../../../lib/booking/types";
import type { ZoneValidationResult } from "../../../lib/zones";

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

type CreateBookingRequestBody = {
  draft?: unknown;
  idempotencyKey?: unknown;
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

function mapZoneStatus(result: ZoneValidationResult): ZoneStatus {
  return result.zoneStatus;
}

export async function POST(request: Request) {
  let body: CreateBookingRequestBody;

  try {
    const parsedBody = await request.json();

    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      throw new Error("Invalid request body.");
    }

    body = parsedBody as CreateBookingRequestBody;
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const idempotencyKey = normalizeIdempotencyKey(body.idempotencyKey);

  if (!isValidIdempotencyKey(idempotencyKey)) {
    return errorResponse("IDEMPOTENCY_KEY_REQUIRED", "A valid idempotency key is required.", 400);
  }

  const parsedDraft = parseBookingDraft(body.draft);

  if (!parsedDraft.draft) {
    return errorResponse("INVALID_BOOKING_DRAFT", "Booking details are required.", 400, {
      errors: parsedDraft.errors,
    });
  }

  const validationErrors = [
    ...parsedDraft.errors,
    ...validateBookingDraftForRequest(parsedDraft.draft),
  ];

  if (validationErrors.length > 0) {
    return errorResponse("BOOKING_VALIDATION_FAILED", "Check the booking details before submitting.", 400, {
      errors: validationErrors,
    });
  }

  let zoneValidation: ZoneValidationResult;

  try {
    zoneValidation = validateServiceZone({
      postcode: parsedDraft.draft.postcode,
      vehicleCount: parsedDraft.draft.vehicleCount,
    });
  } catch (error) {
    if (error instanceof ZoneValidationError) {
      return errorResponse("BOOKING_VALIDATION_FAILED", "Check the booking details before submitting.", 400, {
        errors: [error.message],
      });
    }

    return errorResponse("SERVICE_AREA_CHECK_FAILED", "Service area could not be checked. Please try again.", 500);
  }

  const verifiedZoneStatus = mapZoneValidationToDraftStatus(zoneValidation);

  if (!zoneValidation.allowed) {
    return errorResponse("SERVICE_AREA_NOT_ALLOWED", zoneValidation.message, 400, {
      zoneStatus: zoneValidation.zoneStatus,
      requiredVehicleCount: zoneValidation.requiredVehicleCount,
    });
  }

  if (parsedDraft.draft.zoneCheckStatus !== verifiedZoneStatus) {
    return errorResponse(
      "SERVICE_AREA_RECHECK_REQUIRED",
      "Check the service area again before submitting.",
      409,
      {
        expectedZoneStatus: verifiedZoneStatus,
        receivedZoneStatus: parsedDraft.draft.zoneCheckStatus,
      },
    );
  }

  if (!isDatabaseConfigured()) {
    return errorResponse(
      "BOOKING_PERSISTENCE_NOT_CONFIGURED",
      "Booking request persistence is not configured yet.",
      503,
      {
        reason: "DATABASE_URL must be configured before booking requests can be saved.",
      },
    );
  }

  const existingIdempotentBooking = await getBookingRequestByIdempotencyKey(idempotencyKey);

  if (existingIdempotentBooking) {
    return jsonResponse({
      success: true,
      data: {
        bookingReference: existingIdempotentBooking.bookingReference,
        status: "pending_admin_review",
        statusUrl: `/booking/status/${encodeURIComponent(existingIdempotentBooking.bookingReference)}`,
      },
      message: "Booking request already submitted.",
    });
  }

  const requestSnapshot = createBookingRequestSnapshot({
    bookingReference: createBookingReference(),
    draft: parsedDraft.draft,
  });

  const existingBookings = await getBlockingBookingRecords();
  const slotIsStillAvailable = isRequestedSlotStillAvailable({
    draft: parsedDraft.draft,
    existingBookings,
  });

  if (!slotIsStillAvailable) {
    return errorResponse("SLOT_UNAVAILABLE", "This time is no longer available. Please choose another slot.", 409);
  }

  try {
    const savedBooking = await createBookingRequestRecord({
      draft: parsedDraft.draft,
      idempotencyKey,
      snapshot: requestSnapshot,
      zoneStatus: mapZoneStatus(zoneValidation),
    });

    return jsonResponse(
      {
        success: true,
        data: {
          bookingReference: savedBooking.bookingReference,
          status: "pending_admin_review",
          statusUrl: `/booking/status/${encodeURIComponent(savedBooking.bookingReference)}`,
        },
        message: savedBooking.created
          ? "Booking request submitted for admin review."
          : "Booking request already submitted.",
      },
      savedBooking.created ? 201 : 200,
    );
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return errorResponse("SLOT_UNAVAILABLE", error.message, 409);
    }

    return errorResponse(
      "BOOKING_PERSISTENCE_NOT_CONFIGURED",
      "Booking request could not be saved.",
      503,
      {
        reason: error instanceof Error ? error.message : "Database persistence failed.",
      },
    );
  }
}
