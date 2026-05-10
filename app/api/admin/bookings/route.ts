import {
  parseCreateManualBookingInput,
} from "../../../../lib/admin/manual-booking";
import { getAdminBookingDetail } from "../../../../lib/admin/booking-detail";
import { createManualBooking } from "../../../../lib/admin/manual-booking-persistence";
import { getAvailabilityPersistence } from "../../../../lib/admin/availability";
import { getAdminServicesPricing } from "../../../../lib/admin/services-pricing";
import { getServiceZoneValidationOptions } from "../../../../lib/admin/service-zones";
import { requireAdmin, adminGuardErrorResponse } from "../../../../lib/auth/route-guards";
import { getBlockingBookingRecords } from "../../../../lib/db/booking-repository";
import { isDatabaseConfigured } from "../../../../lib/db/postgres";
import {
  buildNotificationSummaryFromAdminBooking,
  createAdminBookingUrl,
  createPublicBookingStatusUrl,
} from "../../../../lib/notifications/booking-summary";
import { dispatchManualBookingCreatedNotifications } from "../../../../lib/notifications/workflows";

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
  const guard = await requireAdmin(request, { permission: "create_manual_booking" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

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

  const persistenceConfigured = isDatabaseConfigured();
  const existingBookings = persistenceConfigured ? await getBlockingBookingRecords() : [];
  const availability = await getAvailabilityPersistence();
  const pricingData = await getAdminServicesPricing();
  const zoneValidationOptions = await getServiceZoneValidationOptions();
  const result = await createManualBooking(parsed.input, {
    adminAuthenticated: true,
    canCreateManualBooking: true,
    persistenceConfigured,
    existingBookings,
    workingHoursRules: availability.rules,
    availabilityOverrides: availability.overrides,
    zoneValidationOptions,
    pricingData,
  });

  if (!result.success) {
    return errorResponse(result.code, result.message, statusForManualBookingError(result.code), result.details);
  }

  try {
    const booking = await getAdminBookingDetail(result.bookingId);

    if (booking) {
      await dispatchManualBookingCreatedNotifications(
        buildNotificationSummaryFromAdminBooking(booking, {
          statusLabel: result.status === "approved" ? "Confirmed" : "Waiting for review",
        }),
        {
          customerActionUrl: createPublicBookingStatusUrl(result.bookingReference),
          adminActionUrl: createAdminBookingUrl(result.bookingId),
          customerEventType: result.status === "approved" ? "booking_approved" : "booking_request_received",
        },
      );
    }
  } catch {
    // Manual booking creation must not fail because notification lookup or delivery failed.
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
