export type ServiceZoneType = "exact_postcode" | "outward_code" | "district" | "region";

export type ServiceZone = {
  id: string;
  type: ServiceZoneType;
  value: string;
  normalizedValue: string;
  active: boolean;
};

export type ZoneValidationInput = {
  postcode: string;
  regionName?: string;
  vehicleCount: number;
};

export type ZoneValidationSuggestion = {
  type: "region";
  value: string;
};

export type ZoneValidationResult =
  | {
      allowed: true;
      zoneStatus: "standard_zone";
      matchType: ServiceZoneType;
      matchedValue: string;
      message: string;
      suggestions?: ZoneValidationSuggestion[];
    }
  | {
      allowed: true;
      zoneStatus: "outside_zone_volume_exception";
      matchType: "volume_exception";
      requiredVehicleCount: number;
      message: string;
      suggestions?: ZoneValidationSuggestion[];
    }
  | {
      allowed: false;
      zoneStatus: "outside_service_area";
      requiredVehicleCount: number;
      message: string;
      suggestions?: ZoneValidationSuggestion[];
    };

export type ZoneValidationOptions = {
  zones?: ServiceZone[];
  minOutsideZoneVehicleCount?: number;
};
