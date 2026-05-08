import { randomUUID } from "node:crypto";
import { DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT, defaultServiceZones } from "../zones/default-zones";
import { isValidServiceZoneValue, normalizeServiceZoneValue } from "../zones/normalize-postcode";
import type { ServiceZone, ServiceZoneType, ZoneValidationOptions } from "../zones/types";
import { isDatabaseConfigured, query, transaction } from "../db/postgres";
import { adminServiceZoneTypes, serviceZoneTypeLabels } from "./service-zone-types";
import type {
  AdminServiceZoneInput,
  AdminServiceZoneItem,
  AdminServiceZonesData,
  AdminServiceZoneType,
  ServiceZoneMutationOptions,
  ServiceZoneMutationResult,
} from "./service-zone-types";

export { adminServiceZoneTypes, serviceZoneTypeLabels } from "./service-zone-types";
export type {
  AdminServiceZoneInput,
  AdminServiceZoneItem,
  AdminServiceZonesData,
  AdminServiceZoneType,
  ServiceZoneMutationOptions,
  ServiceZoneMutationResult,
} from "./service-zone-types";

const defaultZoneNote = "Current configured default. Replace with database-managed zones before launch.";

type ServiceZoneRow = {
  id: string;
  zone_type: string;
  value: string;
  normalized_value: string;
  active: boolean;
  notes: string | null;
};

export async function getAdminServiceZones(): Promise<AdminServiceZonesData> {
  if (!isDatabaseConfigured()) {
    return {
      isMockData: true,
      zones: defaultServiceZones.map(toDefaultAdminServiceZoneItem),
      outsideZoneSettings: {
        minimumVehicleCount: DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT,
      },
    };
  }

  await seedDefaultServiceZonesIfEmpty();
  const result = await query<ServiceZoneRow>(`
    SELECT id, zone_type, value, normalized_value, active, notes
    FROM service_zones
    ORDER BY active DESC, zone_type ASC, normalized_value ASC, created_at ASC
  `);

  return {
    isMockData: false,
    zones: result.rows.map(toDatabaseAdminServiceZoneItem),
    outsideZoneSettings: {
      minimumVehicleCount: DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT,
    },
  };
}

export async function getServiceZoneValidationOptions(): Promise<ZoneValidationOptions> {
  const data = await getAdminServiceZones();

  return {
    zones: data.zones.map(toServiceZone),
    minOutsideZoneVehicleCount: data.outsideZoneSettings.minimumVehicleCount,
  };
}

function toDefaultAdminServiceZoneItem(zone: (typeof defaultServiceZones)[number]): AdminServiceZoneItem {
  return {
    id: zone.id,
    zoneType: zone.type,
    zoneTypeLabel: serviceZoneTypeLabels[zone.type],
    value: zone.value,
    normalizedValue: zone.normalizedValue,
    active: zone.active,
    notes: defaultZoneNote,
  };
}

function toDatabaseAdminServiceZoneItem(row: ServiceZoneRow): AdminServiceZoneItem {
  const zoneType = toAdminServiceZoneType(row.zone_type);

  return {
    id: row.id,
    zoneType,
    zoneTypeLabel: serviceZoneTypeLabels[zoneType],
    value: row.value,
    normalizedValue: row.normalized_value,
    active: row.active,
    notes: row.notes ?? undefined,
  };
}

function toServiceZone(zone: AdminServiceZoneItem): ServiceZone {
  return {
    id: zone.id,
    type: zone.zoneType,
    value: zone.value,
    normalizedValue: zone.normalizedValue,
    active: zone.active,
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

  const persistenceConfigured = options.persistenceConfigured ?? isDatabaseConfigured();
  const existingZones = options.existingZones ?? (persistenceConfigured ? (await getAdminServiceZones()).zones : undefined);
  const validation = validateServiceZoneInput(input, existingZones);

  if (!validation.success) {
    return validation;
  }

  if (!persistenceConfigured) {
    return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
  }

  try {
    const zoneId = randomUUID();
    const storedValue = formatServiceZoneValueForStorage(input.zoneType, input.value, validation.normalizedValue);

    await transaction(async (client) => {
      await client.query(
        `
          INSERT INTO service_zones (id, zone_type, value, normalized_value, active, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          zoneId,
          input.zoneType,
          storedValue,
          validation.normalizedValue,
          input.active,
          input.notes?.trim() || null,
        ],
      );
      await writeServiceZoneAuditLog(client, {
        adminId: options.adminId,
        zoneId,
        action: "service_zone_created",
        metadata: {
          zoneType: input.zoneType,
          value: storedValue,
          normalizedValue: validation.normalizedValue,
          active: input.active,
        },
      });
    });

    return {
      success: true,
      zoneId,
      normalizedValue: validation.normalizedValue,
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        code: "DUPLICATE_ACTIVE_SERVICE_ZONE",
        message: "An active service zone with this value already exists.",
      };
    }

    throw error;
  }
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

  const persistenceConfigured = options.persistenceConfigured ?? isDatabaseConfigured();
  const existingZones = options.existingZones ?? (persistenceConfigured ? (await getAdminServiceZones()).zones : undefined);
  const zonesForDuplicateCheck = existingZones?.filter((zone) => zone.id !== zoneId);
  const validation = validateServiceZoneInput(input, zonesForDuplicateCheck);

  if (!validation.success) {
    return validation;
  }

  if (!persistenceConfigured) {
    return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
  }

  try {
    const storedValue = formatServiceZoneValueForStorage(input.zoneType, input.value, validation.normalizedValue);

    return await transaction(async (client) => {
      const existingResult = await client.query<ServiceZoneRow>(
        `
          SELECT id, zone_type, value, normalized_value, active, notes
          FROM service_zones
          WHERE id = $1
          LIMIT 1
        `,
        [zoneId],
      );
      const existing = existingResult.rows[0];

      if (!existing) {
        return {
          success: false,
          code: "SERVICE_ZONE_NOT_FOUND",
          message: "Service zone was not found.",
        };
      }

      await client.query(
        `
          UPDATE service_zones
          SET
            zone_type = $2,
            value = $3,
            normalized_value = $4,
            active = $5,
            notes = $6,
            updated_at = now()
          WHERE id = $1
        `,
        [
          zoneId,
          input.zoneType,
          storedValue,
          validation.normalizedValue,
          input.active,
          input.notes?.trim() || null,
        ],
      );
      await writeServiceZoneAuditLog(client, {
        adminId: options.adminId,
        zoneId,
        action: "service_zone_updated",
        metadata: {
          before: {
            zoneType: existing.zone_type,
            value: existing.value,
            normalizedValue: existing.normalized_value,
            active: existing.active,
          },
          after: {
            zoneType: input.zoneType,
            value: storedValue,
            normalizedValue: validation.normalizedValue,
            active: input.active,
          },
        },
      });

      return {
        success: true,
        zoneId,
        normalizedValue: validation.normalizedValue,
      };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        code: "DUPLICATE_ACTIVE_SERVICE_ZONE",
        message: "An active service zone with this value already exists.",
      };
    }

    throw error;
  }
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

  const persistenceConfigured = options.persistenceConfigured ?? isDatabaseConfigured();

  if (!persistenceConfigured) {
    return persistenceNotConfigured("Admin-managed service zones are not connected to database persistence yet.");
  }

  return transaction(async (client) => {
    const result = await client.query<ServiceZoneRow>(
      `
        UPDATE service_zones
        SET active = false, updated_at = now()
        WHERE id = $1
        RETURNING id, zone_type, value, normalized_value, active, notes
      `,
      [zoneId],
    );
    const updated = result.rows[0];

    if (!updated) {
      return {
        success: false,
        code: "SERVICE_ZONE_NOT_FOUND",
        message: "Service zone was not found.",
      };
    }

    await writeServiceZoneAuditLog(client, {
      adminId: options.adminId,
      zoneId,
      action: "service_zone_disabled",
      metadata: {
        zoneType: updated.zone_type,
        value: updated.value,
        normalizedValue: updated.normalized_value,
      },
    });

    return {
      success: true,
      zoneId,
      normalizedValue: updated.normalized_value,
    };
  });
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

async function seedDefaultServiceZonesIfEmpty() {
  const countResult = await query<{ count: string }>("SELECT count(*)::text AS count FROM service_zones");
  const hasRows = Number(countResult.rows[0]?.count ?? "0") > 0;

  if (hasRows) {
    return;
  }

  await transaction(async (client) => {
    for (const zone of defaultServiceZones) {
      await client.query(
        `
          INSERT INTO service_zones (id, zone_type, value, normalized_value, active, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          zone.id,
          zone.type,
          zone.value,
          zone.normalizedValue,
          zone.active,
          "Seeded default service-zone setting.",
        ],
      );
    }
  });
}

function toAdminServiceZoneType(value: string): AdminServiceZoneType {
  return isAdminServiceZoneType(value) ? value : "district";
}

function formatServiceZoneValueForStorage(
  zoneType: AdminServiceZoneType,
  value: string,
  normalizedValue: string,
) {
  if (zoneType === "exact_postcode" || zoneType === "outward_code" || zoneType === "district") {
    return normalizedValue;
  }

  return value.trim().replace(/\s+/g, " ");
}

async function writeServiceZoneAuditLog(
  client: { query: (text: string, values?: unknown[]) => Promise<unknown> },
  input: {
    adminId?: string | null;
    zoneId: string;
    action: string;
    metadata?: Record<string, unknown>;
  },
) {
  await client.query(
    `
      INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
      VALUES ($1, $2, 'service_zone', $3, $4, $5::jsonb)
    `,
    [
      randomUUID(),
      input.adminId ?? null,
      input.zoneId,
      input.action,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
}

function isUniqueConstraintError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "23505",
  );
}

function persistenceNotConfigured(message: string): Extract<ServiceZoneMutationResult, { success: false }> {
  return {
    success: false,
    code: "PERSISTENCE_NOT_CONFIGURED",
    message,
  };
}
