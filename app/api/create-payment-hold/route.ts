import type { CalendarBlockingBooking } from "../../../lib/availability";
import {
  createPaymentHoldSnapshot,
  isRequestedSlotStillAvailable,
  validateBookingDraftForPaymentHold,
} from "../../../lib/booking/holds";
import { createBookingReference } from "../../../lib/booking/references";
import type {
  AddonId,
  BookingDraft,
  BookingVehicle,
  PackageId,
  ParkingAvailability,
  VehicleSize,
  ZoneCheckStatus,
} from "../../../lib/booking/types";
import { addonDefinitions, servicePackages } from "../../../lib/pricing";
import { isValidIdempotencyKey, normalizeIdempotencyKey } from "../../../lib/payments/idempotency";
import { validateServiceZone, ZoneValidationError } from "../../../lib/zones";
import { getServiceZoneValidationOptions } from "../../../lib/admin/service-zones";
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

type ParsedDraftResult =
  | {
      draft: BookingDraft;
      errors: string[];
    }
  | {
      draft: null;
      errors: string[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function readVehicleCount(value: unknown) {
  const vehicleCount = typeof value === "number" ? value : Number(value ?? 1);

  return Number.isFinite(vehicleCount) ? Math.max(Math.floor(vehicleCount), 1) : 1;
}

function isPackageId(value: unknown): value is PackageId {
  return typeof value === "string" && value in servicePackages;
}

function isVehicleSize(value: unknown): value is VehicleSize {
  return value === "small" || value === "medium" || value === "large_4x4";
}

function isAddonId(value: unknown): value is AddonId {
  return typeof value === "string" && value in addonDefinitions;
}

function isParkingAvailability(value: unknown): value is ParkingAvailability {
  return value === "yes" || value === "no" || value === "unknown";
}

function isZoneCheckStatus(value: unknown): value is ZoneCheckStatus {
  return (
    value === "unchecked" ||
    value === "standard_zone" ||
    value === "outside_zone_volume_allowed" ||
    value === "outside_zone_blocked"
  );
}

function mapZoneValidationToDraftStatus(result: ZoneValidationResult): ZoneCheckStatus {
  if (result.zoneStatus === "standard_zone") return "standard_zone";
  if (result.zoneStatus === "outside_zone_volume_exception") return "outside_zone_volume_allowed";

  return "outside_zone_blocked";
}

function parseBookingDraft(value: unknown): ParsedDraftResult {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      draft: null,
      errors: ["Booking draft is required."],
    };
  }

  const vehiclesValue = Array.isArray(value.vehicles) ? value.vehicles : [];
  const vehicles: BookingVehicle[] = vehiclesValue.map((vehicleValue, index) => {
    if (!isRecord(vehicleValue)) {
      errors.push(`Vehicle ${index + 1} is invalid.`);

      return {
        id: `vehicle-${index + 1}`,
        make: "",
        model: "",
        size: "",
        addons: [],
      };
    }

    const addonsValue = Array.isArray(vehicleValue.addons) ? vehicleValue.addons : [];
    const invalidAddonExists = addonsValue.some((addonId) => !isAddonId(addonId));

    if (invalidAddonExists) {
      errors.push(`Vehicle ${index + 1} contains an invalid add-on.`);
    }

    return {
      id: readString(vehicleValue.id) || `vehicle-${index + 1}`,
      make: readString(vehicleValue.make),
      model: readString(vehicleValue.model),
      size: isVehicleSize(vehicleValue.size) ? vehicleValue.size : "",
      addons: addonsValue.filter(isAddonId),
    };
  });
  const customer = isRecord(value.customer) ? value.customer : {};

  if (value.packageId && !isPackageId(value.packageId)) {
    errors.push("Selected service package is invalid.");
  }

  if (value.parkingAvailable && !isParkingAvailability(value.parkingAvailable)) {
    errors.push("Parking availability is invalid.");
  }

  if (value.zoneCheckStatus && !isZoneCheckStatus(value.zoneCheckStatus)) {
    errors.push("Service area status is invalid.");
  }

  return {
    draft: {
      packageId: isPackageId(value.packageId) ? value.packageId : "",
      vehicles,
      postcode: readString(value.postcode),
      fullAddress: readString(value.fullAddress),
      parkingAvailable: isParkingAvailability(value.parkingAvailable) ? value.parkingAvailable : "",
      parkingNotes: readString(value.parkingNotes),
      accessNotes: readString(value.accessNotes),
      zoneCheckStatus: isZoneCheckStatus(value.zoneCheckStatus) ? value.zoneCheckStatus : "unchecked",
      vehicleCount: readVehicleCount(value.vehicleCount),
      selectedDate: readString(value.selectedDate),
      selectedSlotStart: readString(value.selectedSlotStart),
      customer: {
        fullName: readString(customer.fullName),
        phone: readString(customer.phone),
        email: readString(customer.email),
      },
      extraNotes: readString(value.extraNotes),
      marketingPhotoConsent: readBoolean(value.marketingPhotoConsent),
    },
    errors,
  };
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

  const holdSnapshot = createPaymentHoldSnapshot({
    bookingReference: createBookingReference(),
    draft: parsedDraft.draft,
  });

  if (holdSnapshot.duration.serviceDurationMinutes <= 0 || holdSnapshot.price.depositDueMinor <= 0) {
    return errorResponse("INVALID_DEPOSIT_AMOUNT", "Deposit amount could not be calculated.", 400);
  }

  // TODO: Replace this empty list with blocking bookings from PostgreSQL inside a transaction.
  const existingBookings: CalendarBlockingBooking[] = [];
  const slotIsStillAvailable = isRequestedSlotStillAvailable({
    draft: parsedDraft.draft,
    existingBookings,
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
