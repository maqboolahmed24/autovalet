import type { BookingDraft } from "../booking/types";
import { calculateDepositDue, travelBufferMinutes, vehicleSizeLabels } from "../pricing";
import type { DurationBreakdown, PriceBreakdown } from "../pricing/types";
import type { AdminServicesPricingData } from "./services-pricing";

export function calculateBookingPriceFromAdminPricing(
  draft: BookingDraft,
  data: AdminServicesPricingData,
  options: { paymentsEnabled?: boolean } = {},
): PriceBreakdown {
  const primaryVehicle = draft.vehicles[0];

  if (!draft.packageId || !primaryVehicle?.size) {
    return emptyPriceBreakdown();
  }

  const vehicleCount = getVehicleCount(draft.vehicleCount);
  const servicePackage = data.packages.find((item) => item.id === draft.packageId);
  const variant = servicePackage?.variants.find((item) => item.vehicleSize === primaryVehicle.size);

  if (!servicePackage || !variant) {
    return emptyPriceBreakdown();
  }

  const lines: PriceBreakdown["lines"] = [
    {
      label: `${servicePackage.label} (${vehicleSizeLabels[primaryVehicle.size]}) x ${vehicleCount}`,
      amountMinor: variant.priceMinor * vehicleCount,
    },
  ];

  for (const addonId of primaryVehicle.addons) {
    const addon = data.addons.find((item) => item.id === addonId);

    if (!addon) continue;

    lines.push({
      label: `${addon.label} x ${vehicleCount}`,
      amountMinor: addon.priceMinor * vehicleCount,
    });
  }

  const estimatedTotalMinor = lines.reduce((total, line) => total + line.amountMinor, 0);
  const depositDueMinor = options.paymentsEnabled ? calculateDepositDue(estimatedTotalMinor, undefined, vehicleCount) : 0;

  return {
    estimatedTotalMinor,
    depositDueMinor,
    remainingBalanceMinor: Math.max(estimatedTotalMinor - depositDueMinor, 0),
    currency: "GBP",
    lines,
  };
}

export function calculateBookingDurationFromAdminPricing(
  draft: BookingDraft,
  data: AdminServicesPricingData,
): DurationBreakdown {
  const primaryVehicle = draft.vehicles[0];

  if (!draft.packageId || !primaryVehicle?.size) {
    return emptyDurationBreakdown();
  }

  const vehicleCount = getVehicleCount(draft.vehicleCount);
  const servicePackage = data.packages.find((item) => item.id === draft.packageId);
  const variant = servicePackage?.variants.find((item) => item.vehicleSize === primaryVehicle.size);

  if (!servicePackage || !variant) {
    return emptyDurationBreakdown();
  }

  const lines: DurationBreakdown["lines"] = [
    {
      label: `${servicePackage.label} (${vehicleSizeLabels[primaryVehicle.size]}) x ${vehicleCount}`,
      durationMinutes: variant.durationMinutes * vehicleCount,
    },
  ];

  for (const addonId of primaryVehicle.addons) {
    const addon = data.addons.find((item) => item.id === addonId);

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

function getVehicleCount(value: number) {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 1) : 1;
}

function emptyPriceBreakdown(): PriceBreakdown {
  return {
    estimatedTotalMinor: 0,
    depositDueMinor: 0,
    remainingBalanceMinor: 0,
    currency: "GBP",
    lines: [],
  };
}

function emptyDurationBreakdown(): DurationBreakdown {
  return {
    serviceDurationMinutes: 0,
    travelBufferMinutes: 0,
    blockedDurationMinutes: 0,
    lines: [],
  };
}
