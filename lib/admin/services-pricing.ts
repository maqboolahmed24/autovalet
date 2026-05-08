import type { AddonId, BookingDraft, PackageId, VehicleSize } from "../booking/types";
import {
  addonDefinitions,
  addonList,
  servicePackageList,
  servicePackages,
  vehicleSizeLabels,
  vehicleSizeOrder,
} from "../pricing/catalog";
import { calculateBookingDuration } from "../pricing/calculate-duration";
import { calculateBookingPrice } from "../pricing/calculate-price";
import { formatMoneyGBP } from "../pricing/format-money";

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

export async function getAdminServicesPricing(): Promise<AdminServicesPricingData> {
  // TODO: Replace TypeScript catalogue display with admin-managed services, variants and add-ons.
  const previewDraft: BookingDraft = {
    packageId: "maintenance",
    vehicles: [
      {
        id: "preview-vehicle",
        make: "BMW",
        model: "3 Series",
        size: "medium",
        addons: ["engine_bay_clean"],
      },
    ],
    postcode: "CR0 1AA",
    fullAddress: "Preview address",
    parkingAvailable: "yes",
    parkingNotes: "",
    accessNotes: "",
    zoneCheckStatus: "standard_zone",
    vehicleCount: 1,
    selectedDate: "",
    selectedSlotStart: "",
    customer: {
      fullName: "Preview customer",
      phone: "",
      email: "preview@example.com",
    },
    extraNotes: "",
    marketingPhotoConsent: false,
  };
  const price = calculateBookingPrice(previewDraft);
  const duration = calculateBookingDuration(previewDraft);

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
      estimatedTotalLabel: formatMoneyGBP(price.estimatedTotalMinor),
      depositLabel: formatMoneyGBP(price.depositDueMinor),
      serviceDurationLabel: `${duration.serviceDurationMinutes} mins service`,
      blockedDurationLabel: `${duration.blockedDurationMinutes} mins including buffer`,
    },
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

  return persistenceNotConfigured("Admin-managed services and pricing are not connected to database persistence yet.");
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

  return persistenceNotConfigured("Admin-managed add-ons are not connected to database persistence yet.");
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
