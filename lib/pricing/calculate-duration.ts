import type { BookingDraft } from "../booking/types";
import { addonDefinitions, servicePackages, vehicleSizeLabels } from "./catalog";
import type { DurationBreakdown } from "./types";

export const travelBufferMinutes = 45;

export function calculateBookingDuration(draft: BookingDraft): DurationBreakdown {
  const primaryVehicle = draft.vehicles[0];

  if (!draft.packageId || !primaryVehicle?.size) {
    return {
      serviceDurationMinutes: 0,
      travelBufferMinutes: 0,
      blockedDurationMinutes: 0,
      lines: [],
    };
  }

  const vehicleCount = Math.max(draft.vehicleCount, 1);
  const servicePackage = servicePackages[draft.packageId];
  const variant = servicePackage.variants[primaryVehicle.size];
  const lines: DurationBreakdown["lines"] = [
    {
      label: `${servicePackage.label} (${vehicleSizeLabels[primaryVehicle.size]}) x ${vehicleCount}`,
      durationMinutes: variant.durationMinutes * vehicleCount,
    },
  ];

  // TODO: Replace primary-vehicle multiplication once each vehicle has its own package/add-on details.
  for (const addonId of primaryVehicle.addons) {
    const addon = addonDefinitions[addonId];
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
