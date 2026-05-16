import type { AddonId, PackageId, VehicleSize } from "../booking/types";
import type { AddonDefinition, ServicePackage } from "./types";
import { formatMoneyGBP } from "./format-money";

export const vehicleSizeOrder = ["small", "medium", "large_4x4"] as const satisfies readonly VehicleSize[];

export const vehicleSizeLabels: Record<VehicleSize, string> = {
  small: "Small",
  medium: "Medium",
  large_4x4: "Large / 4x4",
};

export const servicePackages: Record<PackageId, ServicePackage> = {
  maintenance: {
    id: "maintenance",
    label: "Maintenance",
    description: "Regular care, refined finish.",
    variants: {
      small: {
        vehicleSize: "small",
        priceMinor: 5500,
        durationMinutes: 60,
      },
      medium: {
        vehicleSize: "medium",
        priceMinor: 6500,
        durationMinutes: 75,
      },
      large_4x4: {
        vehicleSize: "large_4x4",
        priceMinor: 7500,
        durationMinutes: 90,
      },
    },
  },
  deep_clean: {
    id: "deep_clean",
    label: "Deep Clean",
    description: "A deeper level of clean",
    variants: {
      small: {
        vehicleSize: "small",
        priceMinor: 14000,
        durationMinutes: 150,
      },
      medium: {
        vehicleSize: "medium",
        priceMinor: 14500,
        durationMinutes: 180,
      },
      large_4x4: {
        vehicleSize: "large_4x4",
        priceMinor: 15000,
        durationMinutes: 210,
      },
    },
  },
};

export const servicePackageList = [
  servicePackages.maintenance,
  servicePackages.deep_clean,
] as const satisfies readonly ServicePackage[];

export const addonDefinitions: Record<AddonId, AddonDefinition> = {
  engine_bay_clean: {
    id: "engine_bay_clean",
    label: "Engine bay clean",
    priceMinor: 3000,
    extraDurationMinutes: 20,
  },
  windscreen_repellent: {
    id: "windscreen_repellent",
    label: "Windscreen repellent",
    priceMinor: 3000,
    extraDurationMinutes: 15,
  },
  exhaust_tips_polished: {
    id: "exhaust_tips_polished",
    label: "Exhaust tips polished",
    priceMinor: 2000,
    extraDurationMinutes: 15,
  },
  leather_deep_clean: {
    id: "leather_deep_clean",
    label: "Leather deep clean",
    priceMinor: 5000,
    extraDurationMinutes: 40,
  },
  convertible_roof_treatment: {
    id: "convertible_roof_treatment",
    label: "Convertible roof treatment",
    priceMinor: 4000,
    extraDurationMinutes: 30,
  },
  excess_pet_hair_removal: {
    id: "excess_pet_hair_removal",
    label: "Removal of excess pet hair",
    priceMinor: 3000,
    extraDurationMinutes: 45,
  },
  liquid_decon_clay_bar: {
    id: "liquid_decon_clay_bar",
    label: "Liquid decon and clay bar",
    priceMinor: 5000,
    extraDurationMinutes: 50,
  },
};

export const addonList = [
  addonDefinitions.engine_bay_clean,
  addonDefinitions.windscreen_repellent,
  addonDefinitions.exhaust_tips_polished,
  addonDefinitions.leather_deep_clean,
  addonDefinitions.convertible_roof_treatment,
  addonDefinitions.excess_pet_hair_removal,
  addonDefinitions.liquid_decon_clay_bar,
] as const satisfies readonly AddonDefinition[];

export function getServicePackage(packageId: PackageId) {
  return servicePackages[packageId];
}

export function getServiceVariant(packageId: PackageId, vehicleSize: VehicleSize) {
  return servicePackages[packageId].variants[vehicleSize];
}

export function getAddonDefinition(addonId: AddonId) {
  return addonDefinitions[addonId];
}

export function getServicePriceRange(packageId: PackageId) {
  const prices = vehicleSizeOrder.map((vehicleSize) => servicePackages[packageId].variants[vehicleSize].priceMinor);
  return {
    minMinor: Math.min(...prices),
    maxMinor: Math.max(...prices),
  };
}

export function formatServicePriceRange(packageId: PackageId) {
  const range = getServicePriceRange(packageId);

  if (range.minMinor === range.maxMinor) {
    return formatMoneyGBP(range.minMinor);
  }

  return `${formatMoneyGBP(range.minMinor)} - ${formatMoneyGBP(range.maxMinor)}`;
}

export function formatVehicleVariantPrice(packageId: PackageId, vehicleSize: VehicleSize) {
  return formatMoneyGBP(getServiceVariant(packageId, vehicleSize).priceMinor);
}

export function formatVehicleVariantDuration(packageId: PackageId, vehicleSize: VehicleSize) {
  return `${getServiceVariant(packageId, vehicleSize).durationMinutes} mins`;
}
