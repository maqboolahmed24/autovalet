import {
  createPaymentHoldSnapshot,
  isRequestedSlotStillAvailable,
  validateBookingDraftForPaymentHold,
} from "../../../lib/booking/holds";
import { createBookingReference } from "../../../lib/booking/references";
import { mapZoneValidationToDraftStatus, parseBookingDraft } from "../../../lib/booking/draft-parser";
import { isValidIdempotencyKey, normalizeIdempotencyKey } from "../../../lib/payments/idempotency";
import { validateServiceZone, ZoneValidationError } from "../../../lib/zones";
import { getServiceZoneValidationOptions } from "../../../lib/admin/service-zones";
import { getAvailabilityPersistence } from "../../../lib/admin/availability";
import {
  calculateBookingDurationWithAdminPricing,
  calculateBookingPriceWithAdminPricing,
  getAdminServicesPricing,
} from "../../../lib/admin/services-pricing";
import { getBlockingBookingRecords } from "../../../lib/db/booking-repository";
import { isDatabaseConfigured } from "../../../lib/db/postgres";
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

type CreatePaymentHoldRequestBody = {
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

export async function POST(request: Request) {
  let body: CreatePaymentHoldRequestBody;

  try {
    const parsedBody = await request.json();

    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      throw new Error("Invalid request body.");
    }

    body = parsedBody as CreatePaymentHoldRequestBody;
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
    ...validateBookingDraftForPaymentHold(parsedDraft.draft),
  ];

  if (validationErrors.length > 0) {
    return errorResponse("BOOKING_VALIDATION_FAILED", "Check the booking details before payment.", 400, {
      errors: validationErrors,
    });
  }

  let zoneValidation: ZoneValidationResult;

  try {
    const zoneOptions = await getServiceZoneValidationOptions();
    zoneValidation = validateServiceZone({
      postcode: parsedDraft.draft.postcode,
      vehicleCount: parsedDraft.draft.vehicleCount,
    }, zoneOptions);
  } catch (error) {
    if (error instanceof ZoneValidationError) {
      return errorResponse("BOOKING_VALIDATION_FAILED", "Check the booking details before payment.", 400, {
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
      "Check the service area again before payment.",
      409,
      {
        expectedZoneStatus: verifiedZoneStatus,
        receivedZoneStatus: parsedDraft.draft.zoneCheckStatus,
      },
    );
  }

  const pricingData = await getAdminServicesPricing();
  const price = calculateBookingPriceWithAdminPricing(parsedDraft.draft, pricingData);
  const duration = calculateBookingDurationWithAdminPricing(parsedDraft.draft, pricingData);
  const holdSnapshot = createPaymentHoldSnapshot({
    bookingReference: createBookingReference(),
    draft: parsedDraft.draft,
    price,
    duration,
  });

  if (holdSnapshot.duration.serviceDurationMinutes <= 0 || holdSnapshot.price.depositDueMinor <= 0) {
    return errorResponse("INVALID_DEPOSIT_AMOUNT", "Deposit amount could not be calculated.", 400);
  }

  const existingBookings = isDatabaseConfigured() ? await getBlockingBookingRecords() : [];
  const availability = await getAvailabilityPersistence();
  const slotIsStillAvailable = isRequestedSlotStillAvailable({
    draft: parsedDraft.draft,
    existingBookings,
    workingHoursRules: availability.rules,
    availabilityOverrides: availability.overrides,
    duration,
    allowExtendedServiceRequest: true,
  });

  if (!slotIsStillAvailable) {
    return errorResponse("SLOT_UNAVAILABLE", "This time is no longer available. Please choose another slot.", 409);
  }

  return errorResponse(
    "PAYMENT_HOLD_PERSISTENCE_NOT_CONFIGURED",
    "Deposit checkout is not configured yet.",
    503,
    {
      reason: "Database persistence for payment_hold bookings is not configured.",
    },
  );
}
