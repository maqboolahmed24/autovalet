import { DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT, defaultServiceZones } from "../zones/default-zones";
import { isValidServiceZoneValue, normalizeServiceZoneValue } from "../zones/normalize-postcode";
import type { ServiceZoneType } from "../zones/types";

export type AdminServiceZoneType = ServiceZoneType;

export type AdminServiceZoneInput = {
  zoneType: AdminServiceZoneType;
  value: string;
  notes?: string;
  active: boolean;
};

export type AdminServiceZoneItem = {
  id: string;
  zoneType: AdminServiceZoneType;
  zoneTypeLabel: string;
  value: string;
  normalizedValue: string;
  active: boolean;
  notes?: string;
};

export type AdminServiceZonesData = {
  isMockData: boolean;
  zones: AdminServiceZoneItem[];
  outsideZoneSettings: {
    minimumVehicleCount: number;
  };
};

export type ServiceZoneMutationResult =
  | {
      success: true;
      zoneId: string;
      normalizedValue: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type ServiceZoneMutationOptions = {
  adminAuthenticated?: boolean;
  canEditServiceZones?: boolean;
  persistenceConfigured?: boolean;
  existingZones?: AdminServiceZoneItem[];
};

export const adminServiceZoneTypes = [
  "exact_postcode",
  "outward_code",
  "district",
  "region",
] as const satisfies readonly AdminServiceZoneType[];

export const serviceZoneTypeLabels: Record<AdminServiceZoneType, string> = {
  exact_postcode: "Exact postcode",
  outward_code: "Outward code",
  district: "Postcode district",
  region: "Region",
};

const defaultZoneNote = "Current configured default. Replace with database-managed zones before launch.";

export async function getAdminServiceZones(): Promise<AdminServiceZonesData> {
  // TODO: Replace placeholder default zones with admin-managed service_zones rows.
  return {
    isMockData: true,
    zones: defaultServiceZones.map((zone) => ({
      id: zone.id,
      zoneType: zone.type,
      zoneTypeLabel: serviceZoneTypeLabels[zone.type],
      value: zone.value,
      normalizedValue: zone.normalizedValue,
      active: zone.active,
      notes: defaultZoneNote,
    })),
    outsideZoneSettings: {
      minimumVehicleCount: DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT,
    },
  };
}

export async function createServiceZone(
  input: AdminServiceZoneInput,
  options: ServiceZoneMutationOptions = {},
): Promise<ServiceZoneMutationResult> {
  const guard = validateServiceZoneMutationOptions(options);

  if (guard) {
    return guard;
  }

  const validation = validateServiceZoneInput(input, options.existingZones);

  if (!validation.success) {
    return validation;
  }

  if (!options.persistenceConfigured) {
    return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
  }

  return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
}

export async function updateServiceZone(
  zoneId: string,
  input: AdminServiceZoneInput,
  options: ServiceZoneMutationOptions = {},
): Promise<ServiceZoneMutationResult> {
  const guard = validateServiceZoneMutationOptions(options);

  if (guard) {
    return guard;
  }

  if (!zoneId.trim()) {
    return {
      success: false,
      code: "SERVICE_ZONE_ID_REQUIRED",
      message: "Choose a service zone to update.",
    };
  }

  const zonesForDuplicateCheck = options.existingZones?.filter((zone) => zone.id !== zoneId);
  const validation = validateServiceZoneInput(input, zonesForDuplicateCheck);

  if (!validation.success) {
    return validation;
  }

  if (!options.persistenceConfigured) {
    return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
  }

  return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
}

export async function disableServiceZone(
  zoneId: string,
  options: ServiceZoneMutationOptions = {},
): Promise<ServiceZoneMutationResult> {
  const guard = validateServiceZoneMutationOptions(options);

  if (guard) {
    return guard;
  }

  if (!zoneId.trim()) {
    return {
      success: false,
      code: "SERVICE_ZONE_ID_REQUIRED",
      message: "Choose a service zone to disable.",
    };
  }

  if (!options.persistenceConfigured) {
    return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
  }

  return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
}

export function isAdminServiceZoneType(value: unknown): value is AdminServiceZoneType {
  return typeof value === "string" && adminServiceZoneTypes.includes(value as AdminServiceZoneType);
}

export function normalizeAdminServiceZoneValue(zoneType: AdminServiceZoneType, value: string) {
  return normalizeServiceZoneValue(zoneType, value);
}

function validateServiceZoneMutationOptions(
  options: ServiceZoneMutationOptions,
): Extract<ServiceZoneMutationResult, { success: false }> | null {
  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_REQUIRED",
      message: "Admin sign-in is required.",
    };
  }

  if (!options.canEditServiceZones) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account does not have permission to edit service zones.",
    };
  }

  return null;
}

function validateServiceZoneInput(
  input: AdminServiceZoneInput,
  existingZones = defaultServiceZones.map((zone) => ({
    id: zone.id,
    zoneType: zone.type,
    zoneTypeLabel: serviceZoneTypeLabels[zone.type],
    value: zone.value,
    normalizedValue: zone.normalizedValue,
    active: zone.active,
  })),
):
  | {
      success: true;
      normalizedValue: string;
    }
  | Extract<ServiceZoneMutationResult, { success: false }> {
  if (!isAdminServiceZoneType(input.zoneType)) {
    return {
      success: false,
      code: "INVALID_SERVICE_ZONE_TYPE",
      message: "Choose a valid service zone type.",
    };
  }

  if (!input.value.trim()) {
    return {
      success: false,
      code: "SERVICE_ZONE_VALUE_REQUIRED",
      message: "Add a postcode, district or region value.",
    };
  }

  if (!isValidServiceZoneValue(input.zoneType, input.value)) {
    return {
      success: false,
      code: "INVALID_SERVICE_ZONE_VALUE",
      message: "Add a valid service zone value.",
    };
  }

  const normalizedValue = normalizeAdminServiceZoneValue(input.zoneType, input.value);

  if (!normalizedValue) {
    return {
      success: false,
      code: "INVALID_SERVICE_ZONE_VALUE",
      message: "Add a valid service zone value.",
    };
  }

  const duplicate = input.active
    ? existingZones.some(
        (zone) =>
          zone.active &&
          zone.zoneType === input.zoneType &&
          zone.normalizedValue === normalizedValue,
      )
    : false;

  if (duplicate) {
    return {
      success: false,
      code: "DUPLICATE_ACTIVE_SERVICE_ZONE",
      message: "An active service zone with this value already exists.",
    };
  }

  return {
    success: true,
    normalizedValue,
  };
}

function persistenceNotConfigured(message: string): Extract<ServiceZoneMutationResult, { success: false }> {
  return {
    success: false,
    code: "PERSISTENCE_NOT_CONFIGURED",
    message,
  };
}
