import type { AddonId, BookingDraft, PackageId, VehicleSize } from "../../../lib/booking/types";
import {
  BUSINESS_TIMEZONE,
  generateAvailableSlots,
  isPastBusinessDate,
  isValidDateString,
} from "../../../lib/availability";
import { getAvailabilityPersistence } from "../../../lib/admin/availability";
import {
  calculateBookingDurationWithAdminPricing,
  getAdminServicesPricing,
} from "../../../lib/admin/services-pricing";
import { getBlockingBookingRecords } from "../../../lib/db/booking-repository";
import { isDatabaseConfigured } from "../../../lib/db/postgres";
import { addonDefinitions, servicePackages } from "../../../lib/pricing";

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

type AvailableSlotsRequestBody = {
  date?: unknown;
  packageId?: unknown;
  vehicles?: unknown;
  vehicleCount?: unknown;
};

type AvailableSlotsRequestVehicle = {
  size?: unknown;
  addons?: unknown;
};

function jsonResponse<TData>(body: ApiSuccessResponse<TData> | ApiErrorResponse, status = 200) {
  return Response.json(body, { status });
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

function getVehicleCount(value: unknown) {
  const vehicleCount = typeof value === "number" ? value : Number(value ?? 1);

  if (!Number.isFinite(vehicleCount)) {
    return 1;
  }

  return Math.max(Math.floor(vehicleCount), 1);
}

function getRequestVehicle(value: unknown): AvailableSlotsRequestVehicle | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as AvailableSlotsRequestVehicle;
}

function getBookingDraftForDuration(body: AvailableSlotsRequestBody): BookingDraft {
  const requestVehicles = Array.isArray(body.vehicles) ? body.vehicles : [];
  const primaryRequestVehicle = getRequestVehicle(requestVehicles[0]);
  const packageId = isPackageId(body.packageId) ? body.packageId : "";
  const vehicleSize = isVehicleSize(primaryRequestVehicle?.size) ? primaryRequestVehicle.size : "";
  const addons = Array.isArray(primaryRequestVehicle?.addons)
    ? primaryRequestVehicle.addons.filter(isAddonId)
    : [];

  return {
    packageId,
    vehicles: [
      {
        id: "vehicle-1",
        make: "",
        model: "",
        size: vehicleSize,
        addons,
      },
    ],
    postcode: "",
    fullAddress: "",
    parkingAvailable: "",
    parkingNotes: "",
    accessNotes: "",
    zoneCheckStatus: "unchecked",
    vehicleCount: getVehicleCount(body.vehicleCount),
    selectedDate: typeof body.date === "string" ? body.date : "",
    selectedSlotStart: "",
    customer: {
      fullName: "",
      phone: "",
      email: "",
    },
    extraNotes: "",
    marketingPhotoConsent: false,
  };
}

function validateSlotRequest(body: AvailableSlotsRequestBody) {
  if (typeof body.date !== "string" || !isValidDateString(body.date)) {
    return "Choose a valid request date.";
  }

  if (isPastBusinessDate(body.date)) {
    return "Choose a current or future request date.";
  }

  if (!isPackageId(body.packageId)) {
    return "Choose a valid service package first.";
  }

  const vehicles = Array.isArray(body.vehicles) ? body.vehicles : [];
  const primaryVehicle = getRequestVehicle(vehicles[0]);

  if (!isVehicleSize(primaryVehicle?.size)) {
    return "Choose a valid vehicle size first.";
  }

  if (Array.isArray(primaryVehicle?.addons) && primaryVehicle.addons.some((addonId) => !isAddonId(addonId))) {
    return "Choose valid add-ons only.";
  }

  return "";
}

export async function POST(request: Request) {
  let body: AvailableSlotsRequestBody;

  try {
    const parsedBody = await request.json();

    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      throw new Error("Invalid request body.");
    }

    body = parsedBody as AvailableSlotsRequestBody;
  } catch {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
          details: {},
        },
      },
      400,
    );
  }

  const validationMessage = validateSlotRequest(body);

  if (validationMessage) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INVALID_SLOT_REQUEST",
          message: validationMessage,
          details: {},
        },
      },
      400,
    );
  }

  const draft = getBookingDraftForDuration(body);
  const pricingData = await getAdminServicesPricing();
  const duration = calculateBookingDurationWithAdminPricing(draft, pricingData);

  if (duration.serviceDurationMinutes <= 0) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INVALID_SERVICE_DURATION",
          message: "Service duration could not be calculated. Check the selected service and vehicle.",
          details: {},
        },
      },
      400,
    );
  }

  const existingBookings = isDatabaseConfigured() ? await getBlockingBookingRecords() : [];
  const availability = await getAvailabilityPersistence();
  const now = Date.now();
  const slots = generateAvailableSlots({
    date: draft.selectedDate,
    serviceDurationMinutes: duration.serviceDurationMinutes,
    travelBufferMinutes: duration.travelBufferMinutes,
    workingHoursRules: availability.rules,
    overrides: availability.overrides,
    existingBookings,
  }).filter((slot) => Date.parse(slot.start) > now);

  return jsonResponse({
    success: true,
    data: {
      date: draft.selectedDate,
      timezone: BUSINESS_TIMEZONE,
      serviceDurationMinutes: duration.serviceDurationMinutes,
      travelBufferMinutes: duration.travelBufferMinutes,
      slots,
    },
    message: slots.length
      ? "Available request times loaded."
      : "No request times are available for this date.",
  });
}
