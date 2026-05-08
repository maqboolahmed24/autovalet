import type { ServiceZoneType } from "../zones/types";

export type AdminServiceZoneType = ServiceZoneType;

export type AdminServiceZoneInput = {
  zoneType: AdminServiceZoneType;
  value: string;
  notes?: string;
  active: boolean;
};

export type AdminServiceZoneItem = {
  id: string;
  zoneType: AdminServiceZoneType;
  zoneTypeLabel: string;
  value: string;
  normalizedValue: string;
  active: boolean;
  notes?: string;
};

export type AdminServiceZonesData = {
  isMockData: boolean;
  zones: AdminServiceZoneItem[];
  outsideZoneSettings: {
    minimumVehicleCount: number;
  };
};

export type ServiceZoneMutationResult =
  | {
      success: true;
      zoneId: string;
      normalizedValue: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type ServiceZoneMutationOptions = {
  adminAuthenticated?: boolean;
  canEditServiceZones?: boolean;
  persistenceConfigured?: boolean;
  existingZones?: AdminServiceZoneItem[];
  adminId?: string;
};

export const adminServiceZoneTypes = [
  "exact_postcode",
  "outward_code",
  "district",
  "region",
] as const satisfies readonly AdminServiceZoneType[];

export const serviceZoneTypeLabels: Record<AdminServiceZoneType, string> = {
  exact_postcode: "Exact postcode",
  outward_code: "Outward code",
  district: "Postcode district",
  region: "Region",
};
