import type { ServiceZone } from "./types";

export const DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT = 3;

// TODO: Replace placeholder default zones with admin-managed zones before launch.
export const defaultServiceZones: ServiceZone[] = [
  {
    id: "zone-cr0",
    type: "district",
    value: "CR0",
    normalizedValue: "CR0",
    active: true,
  },
  {
    id: "zone-croydon",
    type: "region",
    value: "Croydon",
    normalizedValue: "CROYDON",
    active: true,
  },
];
