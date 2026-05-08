import type {
  AddonId,
  BookingDraft,
  BookingVehicle,
  PackageId,
  ParkingAvailability,
  VehicleSize,
  ZoneCheckStatus,
} from "./types";
import { addonDefinitions, servicePackages } from "../pricing";
import type { ZoneValidationResult } from "../zones";

export type ParsedDraftResult =
  | {
      draft: BookingDraft;
      errors: string[];
    }
  | {
      draft: null;
      errors: string[];
    };

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

export function mapZoneValidationToDraftStatus(result: ZoneValidationResult): ZoneCheckStatus {
  if (result.zoneStatus === "standard_zone") return "standard_zone";
  if (result.zoneStatus === "outside_zone_volume_exception") return "outside_zone_volume_allowed";

  return "outside_zone_blocked";
}

export function parseBookingDraft(value: unknown): ParsedDraftResult {
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
