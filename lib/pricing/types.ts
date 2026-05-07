import type { AddonId, PackageId, VehicleSize } from "../booking/types";

export type CurrencyCode = "GBP";

export type MinorUnitAmount = number;

export type MoneyMinor = MinorUnitAmount;

export type ServiceVariant = {
  vehicleSize: VehicleSize;
  priceMinor: MoneyMinor;
  durationMinutes: number;
};

export type ServicePackage = {
  id: PackageId;
  label: string;
  description: string;
  variants: Record<VehicleSize, ServiceVariant>;
};

export type AddonDefinition = {
  id: AddonId;
  label: string;
  priceMinor: MoneyMinor;
  extraDurationMinutes: number;
};

export type ServicePricingVariant = {
  serviceId: PackageId;
  vehicleSize: VehicleSize;
  priceMinor: MinorUnitAmount;
  durationMinutes: number;
  active: boolean;
};

export type AddonPricing = {
  addonId: AddonId;
  priceMinor: MinorUnitAmount;
  extraDurationMinutes: number;
  active: boolean;
};

export type BookingPriceEstimate = {
  estimatedTotalMinor: MinorUnitAmount;
  depositDueMinor: MinorUnitAmount;
  depositPaidMinor: MinorUnitAmount;
  balanceDueMinor: MinorUnitAmount;
  currency: CurrencyCode;
};

export type PriceBreakdown = {
  estimatedTotalMinor: MoneyMinor;
  depositDueMinor: MoneyMinor;
  remainingBalanceMinor: MoneyMinor;
  currency: CurrencyCode;
  lines: {
    label: string;
    amountMinor: MoneyMinor;
  }[];
};

export type DurationBreakdown = {
  serviceDurationMinutes: number;
  travelBufferMinutes: number;
  blockedDurationMinutes: number;
  lines: {
    label: string;
    durationMinutes: number;
  }[];
};
