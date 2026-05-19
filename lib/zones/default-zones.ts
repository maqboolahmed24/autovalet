import type { ServiceZone } from "./types";
import { greaterManchesterServiceAreas } from "../service-areas";

export const DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT = 3;

export const defaultServiceZones: ServiceZone[] = [
  ...greaterManchesterServiceAreas.map<ServiceZone>((area) => ({
    id: `zone-${area.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    type: "region",
    value: area,
    normalizedValue: area.toUpperCase(),
    active: true,
  })),
];
