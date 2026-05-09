import { randomUUID } from "node:crypto";
import type { AddonId, BookingDraft, PackageId, VehicleSize } from "../booking/types";
import {
  addonDefinitions,
  addonList,
  servicePackageList,
  servicePackages,
  vehicleSizeLabels,
  vehicleSizeOrder,
} from "../pricing/catalog";
import { isDatabaseConfigured, query, transaction } from "../db/postgres";
import { arePaymentsEnabled } from "../config/features";
import { calculateDepositDue } from "../pricing/deposits";
import { formatMoneyGBP } from "../pricing/format-money";
import { travelBufferMinutes } from "../pricing/calculate-duration";
import type { DurationBreakdown, PriceBreakdown } from "../pricing/types";

export type AdminServiceVariantRow = {
  vehicleSize: VehicleSize;
  vehicleSizeLabel: string;
  priceMinor: number;
  priceLabel: string;
  durationMinutes: number;
};

export type AdminServicePackage = {
  id: PackageId;
  label: string;
  description: string;
  active: boolean;
  variants: AdminServiceVariantRow[];
};

export type AdminAddonItem = {
  id: AddonId;
  label: string;
  priceMinor: number;
  priceLabel: string;
  extraDurationMinutes: number;
  active: boolean;
};

export type AdminServicesPricingData = {
  isMockData: boolean;
  packages: AdminServicePackage[];
  addons: AdminAddonItem[];
  preview: {
    title: string;
    estimatedTotalLabel: string;
    depositLabel: string;
    serviceDurationLabel: string;
    blockedDurationLabel: string;
  };
};

export type UpdateServiceVariantInput = {
  serviceId: PackageId;
  active?: boolean;
  variants: {
    vehicleSize: VehicleSize;
    priceMinor: number;
    durationMinutes: number;
  }[];
};

export type UpdateAddonInput = {
  addonId: AddonId;
  label?: string;
  priceMinor: number;
  extraDurationMinutes: number;
  active?: boolean;
};

export type ServicePricingMutationResult =
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type ServicePricingMutationOptions = {
  adminAuthenticated?: boolean;
  canEditServicesPricing?: boolean;
  persistenceConfigured?: boolean;
};

type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  display_order: number;
};

type ServiceVariantRow = {
  service_id: string;
  vehicle_size: string;
  price_minor: number;
  duration_minutes: number;
};

type AddonRow = {
  id: string;
  name: string;
  price_minor: number;
  extra_duration_minutes: number;
  active: boolean;
  display_order: number;
};

async function seedServicesCatalogIfEmpty() {
  await transaction(async (client) => {
    const serviceCountResult = await client.query<{ count: string }>("SELECT count(*) FROM services");
    const addonCountResult = await client.query<{ count: string }>("SELECT count(*) FROM addons");
    const shouldSeedServices = Number(serviceCountResult.rows[0]?.count ?? 0) === 0;
    const shouldSeedAddons = Number(addonCountResult.rows[0]?.count ?? 0) === 0;

    if (shouldSeedServices) {
      for (const [serviceIndex, servicePackage] of servicePackageList.entries()) {
        await client.query(
          `
            INSERT INTO services (id, name, description, active, display_order)
            VALUES ($1, $2, $3, true, $4)
            ON CONFLICT (id) DO NOTHING
          `,
          [servicePackage.id, servicePackage.label, servicePackage.description, serviceIndex],
        );

        for (const vehicleSize of vehicleSizeOrder) {
          const variant = servicePackage.variants[vehicleSize];

          await client.query(
            `
              INSERT INTO service_variants (
                id,
                service_id,
                vehicle_size,
                price_minor,
                duration_minutes,
                active
              )
              VALUES ($1, $2, $3, $4, $5, true)
              ON CONFLICT (service_id, vehicle_size) DO NOTHING
            `,
            [
              randomUUID(),
              servicePackage.id,
              vehicleSize,
              variant.priceMinor,
              variant.durationMinutes,
            ],
          );
        }
      }
    }

    if (shouldSeedAddons) {
      for (const [addonIndex, addon] of addonList.entries()) {
        await client.query(
          `
            INSERT INTO addons (
              id,
              name,
              price_minor,
              extra_duration_minutes,
              active,
              display_order
            )
            VALUES ($1, $2, $3, $4, true, $5)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            addon.id,
            addon.label,
            addon.priceMinor,
            addon.extraDurationMinutes,
            addonIndex,
          ],
        );
      }
    }
  });
}

function buildFallbackServicesPricing(): AdminServicesPricingData {
  const maintenance = servicePackages.maintenance;
  const previewVariant = maintenance.variants.medium;
  const previewAddon = addonDefinitions.engine_bay_clean;
  const estimatedTotalMinor = previewVariant.priceMinor + previewAddon.priceMinor;
  const serviceDurationMinutes = previewVariant.durationMinutes + previewAddon.extraDurationMinutes;
  const travelBufferMinutes = serviceDurationMinutes > 0 ? 45 : 0;

  return {
    isMockData: true,
    packages: servicePackageList.map((servicePackage) => ({
      id: servicePackage.id,
      label: servicePackage.label,
      description: servicePackage.description,
      active: true,
      variants: vehicleSizeOrder.map((vehicleSize) => {
        const variant = servicePackage.variants[vehicleSize];

        return {
          vehicleSize,
          vehicleSizeLabel: vehicleSizeLabels[vehicleSize],
          priceMinor: variant.priceMinor,
          priceLabel: formatMoneyGBP(variant.priceMinor),
          durationMinutes: variant.durationMinutes,
        };
      }),
    })),
    addons: addonList.map((addon) => ({
      id: addon.id,
      label: addon.label,
      priceMinor: addon.priceMinor,
      priceLabel: formatMoneyGBP(addon.priceMinor),
      extraDurationMinutes: addon.extraDurationMinutes,
      active: true,
    })),
    preview: {
      title: "Maintenance medium with engine bay clean",
      estimatedTotalLabel: formatMoneyGBP(estimatedTotalMinor),
      depositLabel: formatMoneyGBP(0),
      serviceDurationLabel: `${serviceDurationMinutes} mins service`,
      blockedDurationLabel: `${serviceDurationMinutes + travelBufferMinutes} mins including buffer`,
    },
  };
}

function toPackageId(value: string): PackageId {
  return isPackageId(value) ? value : "maintenance";
}

function toAddonId(value: string): AddonId {
  return isAddonId(value) ? value : "engine_bay_clean";
}

function toVehicleSize(value: string): VehicleSize {
  return isVehicleSize(value) ? value : "small";
}

function buildPreview(packages: AdminServicePackage[], addons: AdminAddonItem[]) {
  const maintenance = packages.find((item) => item.id === "maintenance") ?? packages[0];
  const mediumVariant = maintenance?.variants.find((variant) => variant.vehicleSize === "medium")
    ?? maintenance?.variants[0];
  const engineBay = addons.find((addon) => addon.id === "engine_bay_clean");
  const estimatedTotalMinor = (mediumVariant?.priceMinor ?? 0) + (engineBay?.priceMinor ?? 0);
  const serviceDurationMinutes = (mediumVariant?.durationMinutes ?? 0) + (engineBay?.extraDurationMinutes ?? 0);
  const blockedDurationMinutes = serviceDurationMinutes > 0 ? serviceDurationMinutes + 45 : 0;

  return {
    title: `${maintenance?.label ?? "Package"} ${mediumVariant?.vehicleSizeLabel ?? "vehicle"}${engineBay ? ` with ${engineBay.label.toLowerCase()}` : ""}`,
    estimatedTotalLabel: formatMoneyGBP(estimatedTotalMinor),
    depositLabel: formatMoneyGBP(0),
    serviceDurationLabel: `${serviceDurationMinutes} mins service`,
    blockedDurationLabel: `${blockedDurationMinutes} mins including buffer`,
  };
}

export async function getAdminServicesPricing(): Promise<AdminServicesPricingData> {
  if (!isDatabaseConfigured()) {
    return buildFallbackServicesPricing();
  }

  await seedServicesCatalogIfEmpty();

  const [servicesResult, variantsResult, addonsResult] = await Promise.all([
    query<ServiceRow>(
      `
        SELECT id, name, description, active, display_order
        FROM services
        ORDER BY display_order ASC, name ASC
      `,
    ),
    query<ServiceVariantRow>(
      `
        SELECT service_id, vehicle_size, price_minor, duration_minutes
        FROM service_variants
        ORDER BY service_id ASC, vehicle_size ASC
      `,
    ),
    query<AddonRow>(
      `
        SELECT id, name, price_minor, extra_duration_minutes, active, display_order
        FROM addons
        ORDER BY display_order ASC, name ASC
      `,
    ),
  ]);
  const variantsByService = new Map<string, ServiceVariantRow[]>();

  for (const variant of variantsResult.rows) {
    const variants = variantsByService.get(variant.service_id) ?? [];
    variants.push(variant);
    variantsByService.set(variant.service_id, variants);
  }

  const packages = servicesResult.rows.map((service): AdminServicePackage => {
    const dbVariants = variantsByService.get(service.id) ?? [];
    const variants = vehicleSizeOrder.map((vehicleSize) => {
      const variant = dbVariants.find((item) => item.vehicle_size === vehicleSize);
      const fallback = servicePackages[toPackageId(service.id)].variants[vehicleSize];
      const priceMinor = variant?.price_minor ?? fallback.priceMinor;
      const durationMinutes = variant?.duration_minutes ?? fallback.durationMinutes;

      return {
        vehicleSize,
        vehicleSizeLabel: vehicleSizeLabels[vehicleSize],
        priceMinor,
        priceLabel: formatMoneyGBP(priceMinor),
        durationMinutes,
      };
    });

    return {
      id: toPackageId(service.id),
      label: service.name,
      description: service.description ?? "",
      active: service.active,
      variants,
    };
  });
  const addons = addonsResult.rows.map((addon): AdminAddonItem => ({
    id: toAddonId(addon.id),
    label: addon.name,
    priceMinor: addon.price_minor,
    priceLabel: formatMoneyGBP(addon.price_minor),
    extraDurationMinutes: addon.extra_duration_minutes,
    active: addon.active,
  }));

  return {
    isMockData: false,
    packages,
    addons,
    preview: buildPreview(packages, addons),
  };
}

export function calculateBookingPriceWithAdminPricing(
  draft: BookingDraft,
  data: AdminServicesPricingData,
  options: { paymentsEnabled?: boolean } = {},
): PriceBreakdown {
  const primaryVehicle = draft.vehicles[0];

  if (!draft.packageId || !primaryVehicle?.size) {
    return {
      estimatedTotalMinor: 0,
      depositDueMinor: 0,
      remainingBalanceMinor: 0,
      currency: "GBP",
      lines: [],
    };
  }

  const vehicleCount = Number.isFinite(draft.vehicleCount) ? Math.max(Math.floor(draft.vehicleCount), 1) : 1;
  const servicePackage = data.packages.find((item) => item.id === draft.packageId)
    ?? buildFallbackServicesPricing().packages.find((item) => item.id === draft.packageId);
  const variant = servicePackage?.variants.find((item) => item.vehicleSize === primaryVehicle.size);

  if (!servicePackage || !variant) {
    return {
      estimatedTotalMinor: 0,
      depositDueMinor: 0,
      remainingBalanceMinor: 0,
      currency: "GBP",
      lines: [],
    };
  }

  const lines: PriceBreakdown["lines"] = [
    {
      label: `${servicePackage.label} (${vehicleSizeLabels[primaryVehicle.size]}) x ${vehicleCount}`,
      amountMinor: variant.priceMinor * vehicleCount,
    },
  ];

  for (const addonId of primaryVehicle.addons) {
    const addon = data.addons.find((item) => item.id === addonId)
      ?? buildFallbackServicesPricing().addons.find((item) => item.id === addonId);

    if (!addon) continue;

    lines.push({
      label: `${addon.label} x ${vehicleCount}`,
      amountMinor: addon.priceMinor * vehicleCount,
    });
  }

  const estimatedTotalMinor = lines.reduce((total, line) => total + line.amountMinor, 0);
  const paymentsEnabled = options.paymentsEnabled ?? arePaymentsEnabled();
  const depositDueMinor = paymentsEnabled ? calculateDepositDue(estimatedTotalMinor) : 0;

  return {
    estimatedTotalMinor,
    depositDueMinor,
    remainingBalanceMinor: Math.max(estimatedTotalMinor - depositDueMinor, 0),
    currency: "GBP",
    lines,
  };
}

export function calculateBookingDurationWithAdminPricing(
  draft: BookingDraft,
  data: AdminServicesPricingData,
): DurationBreakdown {
  const primaryVehicle = draft.vehicles[0];

  if (!draft.packageId || !primaryVehicle?.size) {
    return {
      serviceDurationMinutes: 0,
      travelBufferMinutes: 0,
      blockedDurationMinutes: 0,
      lines: [],
    };
  }

  const vehicleCount = Number.isFinite(draft.vehicleCount) ? Math.max(Math.floor(draft.vehicleCount), 1) : 1;
  const fallbackData = buildFallbackServicesPricing();
  const servicePackage = data.packages.find((item) => item.id === draft.packageId)
    ?? fallbackData.packages.find((item) => item.id === draft.packageId);
  const variant = servicePackage?.variants.find((item) => item.vehicleSize === primaryVehicle.size);

  if (!servicePackage || !variant) {
    return {
      serviceDurationMinutes: 0,
      travelBufferMinutes: 0,
      blockedDurationMinutes: 0,
      lines: [],
    };
  }

  const lines: DurationBreakdown["lines"] = [
    {
      label: `${servicePackage.label} (${vehicleSizeLabels[primaryVehicle.size]}) x ${vehicleCount}`,
      durationMinutes: variant.durationMinutes * vehicleCount,
    },
  ];

  for (const addonId of primaryVehicle.addons) {
    const addon = data.addons.find((item) => item.id === addonId)
      ?? fallbackData.addons.find((item) => item.id === addonId);

    if (!addon) continue;

    lines.push({
      label: `${addon.label} x ${vehicleCount}`,
      durationMinutes: addon.extraDurationMinutes * vehicleCount,
    });
  }

  const serviceDurationMinutes = lines.reduce((total, line) => total + line.durationMinutes, 0);
  const bufferMinutes = serviceDurationMinutes > 0 ? travelBufferMinutes : 0;

  return {
    serviceDurationMinutes,
    travelBufferMinutes: bufferMinutes,
    blockedDurationMinutes: serviceDurationMinutes + bufferMinutes,
    lines,
  };
}

export async function updateServiceVariant(
  input: UpdateServiceVariantInput,
  options: ServicePricingMutationOptions = {},
): Promise<ServicePricingMutationResult> {
  const guard = validateServicePricingMutationOptions(options);

  if (guard) {
    return guard;
  }

  const validation = validateServiceVariantInput(input);

  if (validation) {
    return validation;
  }

  if (!options.persistenceConfigured) {
    return persistenceNotConfigured("Admin-managed services and pricing are not connected to database persistence yet.");
  }

  await seedServicesCatalogIfEmpty();

  await transaction(async (client) => {
    await client.query(
      `
        UPDATE services
        SET active = COALESCE($2, active),
          updated_at = now()
        WHERE id = $1
      `,
      [input.serviceId, input.active ?? null],
    );

    for (const variant of input.variants) {
      await client.query(
        `
          INSERT INTO service_variants (
            id,
            service_id,
            vehicle_size,
            price_minor,
            duration_minutes,
            active,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, true, now())
          ON CONFLICT (service_id, vehicle_size)
          DO UPDATE SET
            price_minor = EXCLUDED.price_minor,
            duration_minutes = EXCLUDED.duration_minutes,
            active = true,
            updated_at = now()
        `,
        [
          randomUUID(),
          input.serviceId,
          variant.vehicleSize,
          variant.priceMinor,
          variant.durationMinutes,
        ],
      );
    }
  });

  return {
    success: true,
    id: input.serviceId,
  };
}

export async function updateAddon(
  input: UpdateAddonInput,
  options: ServicePricingMutationOptions = {},
): Promise<ServicePricingMutationResult> {
  const guard = validateServicePricingMutationOptions(options);

  if (guard) {
    return guard;
  }

  const validation = validateAddonInput(input);

  if (validation) {
    return validation;
  }

  if (!options.persistenceConfigured) {
    return persistenceNotConfigured("Admin-managed add-ons are not connected to database persistence yet.");
  }

  await seedServicesCatalogIfEmpty();

  const label = input.label?.trim() || addonDefinitions[input.addonId].label;

  await query(
    `
      INSERT INTO addons (
        id,
        name,
        price_minor,
        extra_duration_minutes,
        active,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, now())
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        price_minor = EXCLUDED.price_minor,
        extra_duration_minutes = EXCLUDED.extra_duration_minutes,
        active = EXCLUDED.active,
        updated_at = now()
    `,
    [
      input.addonId,
      label,
      input.priceMinor,
      input.extraDurationMinutes,
      input.active ?? true,
    ],
  );

  return {
    success: true,
    id: input.addonId,
  };
}

export function isPackageId(value: unknown): value is PackageId {
  return typeof value === "string" && value in servicePackages;
}

export function isAddonId(value: unknown): value is AddonId {
  return typeof value === "string" && value in addonDefinitions;
}

export function isVehicleSize(value: unknown): value is VehicleSize {
  return typeof value === "string" && vehicleSizeOrder.includes(value as VehicleSize);
}

function validateServicePricingMutationOptions(
  options: ServicePricingMutationOptions,
): Extract<ServicePricingMutationResult, { success: false }> | null {
  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_REQUIRED",
      message: "Admin sign-in is required.",
    };
  }

  if (!options.canEditServicesPricing) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account does not have permission to edit services and pricing.",
    };
  }

  return null;
}

function validateServiceVariantInput(
  input: UpdateServiceVariantInput,
): Extract<ServicePricingMutationResult, { success: false }> | null {
  if (!isPackageId(input.serviceId)) {
    return {
      success: false,
      code: "INVALID_SERVICE_ID",
      message: "Choose a valid service package.",
    };
  }

  const variantsBySize = new Map(input.variants.map((variant) => [variant.vehicleSize, variant]));

  for (const vehicleSize of vehicleSizeOrder) {
    const variant = variantsBySize.get(vehicleSize);

    if (!variant) {
      return {
        success: false,
        code: "SERVICE_VARIANT_REQUIRED",
        message: `Add pricing and duration for ${vehicleSizeLabels[vehicleSize]}.`,
      };
    }

    if (!isWholeMinorAmount(variant.priceMinor) || variant.priceMinor < 0) {
      return {
        success: false,
        code: "INVALID_SERVICE_PRICE",
        message: "Service prices must be integer pence amounts of zero or more.",
      };
    }

    if (!Number.isInteger(variant.durationMinutes) || variant.durationMinutes <= 0) {
      return {
        success: false,
        code: "INVALID_SERVICE_DURATION",
        message: "Service duration must be an integer number of minutes above zero.",
      };
    }
  }

  return null;
}

function validateAddonInput(input: UpdateAddonInput): Extract<ServicePricingMutationResult, { success: false }> | null {
  if (!isAddonId(input.addonId)) {
    return {
      success: false,
      code: "INVALID_ADDON_ID",
      message: "Choose a valid add-on.",
    };
  }

  if (!isWholeMinorAmount(input.priceMinor) || input.priceMinor < 0) {
    return {
      success: false,
      code: "INVALID_ADDON_PRICE",
      message: "Add-on price must be an integer pence amount of zero or more.",
    };
  }

  if (!Number.isInteger(input.extraDurationMinutes) || input.extraDurationMinutes < 0) {
    return {
      success: false,
      code: "INVALID_ADDON_DURATION",
      message: "Add-on duration must be an integer number of minutes of zero or more.",
    };
  }

  return null;
}

function isWholeMinorAmount(value: number) {
  return Number.isInteger(value) && Number.isFinite(value);
}

function persistenceNotConfigured(message: string): Extract<ServicePricingMutationResult, { success: false }> {
  return {
    success: false,
    code: "PERSISTENCE_NOT_CONFIGURED",
    message,
  };
}
