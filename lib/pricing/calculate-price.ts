import type { BookingDraft } from "../booking/types";
import { addonDefinitions, servicePackages, vehicleSizeLabels } from "./catalog";
import { calculateDepositDue } from "./deposits";
import type { PriceBreakdown } from "./types";

export function calculateBookingPrice(draft: BookingDraft): PriceBreakdown {
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
  const servicePackage = servicePackages[draft.packageId];
  const variant = servicePackage.variants[primaryVehicle.size];
  const lines: PriceBreakdown["lines"] = [
    {
      label: `${servicePackage.label} (${vehicleSizeLabels[primaryVehicle.size]}) x ${vehicleCount}`,
      amountMinor: variant.priceMinor * vehicleCount,
    },
  ];

  // TODO: Replace primary-vehicle multiplication once each vehicle has its own package/add-on details.
  for (const addonId of primaryVehicle.addons) {
    const addon = addonDefinitions[addonId];
    lines.push({
      label: `${addon.label} x ${vehicleCount}`,
      amountMinor: addon.priceMinor * vehicleCount,
    });
  }

  const estimatedTotalMinor = lines.reduce((total, line) => total + line.amountMinor, 0);
  const depositDueMinor = calculateDepositDue(estimatedTotalMinor);

  return {
    estimatedTotalMinor,
    depositDueMinor,
    remainingBalanceMinor: Math.max(estimatedTotalMinor - depositDueMinor, 0),
    currency: "GBP",
    lines,
  };
}
