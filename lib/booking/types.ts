export type VehicleSize = "small" | "medium" | "large_4x4";

export type PackageId = "maintenance" | "deep_clean";

export type AddonId =
  | "engine_bay_clean"
  | "windscreen_repellent"
  | "exhaust_tips_polished"
  | "leather_deep_clean"
  | "convertible_roof_treatment"
  | "excess_pet_hair_removal"
  | "liquid_decon_clay_bar";

export type BookingStatus =
  | "draft"
  | "zone_validated"
  | "payment_hold"
  | "pending_admin_review"
  | "approved"
  | "declined"
  | "reschedule_requested"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled_by_customer"
  | "cancelled_by_admin"
  | "no_show"
  | "expired"
  | "payment_failed"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "transferred";

export type ZoneStatus =
  | "standard_zone"
  | "outside_zone_volume_exception"
  | "outside_service_area";

export type BookingSource =
  | "public_booking"
  | "admin_manual"
  | "phone"
  | "instagram"
  | "whatsapp"
  | "referral";

export type ZoneCheckStatus =
  | "unchecked"
  | "standard_zone"
  | "outside_zone_volume_allowed"
  | "outside_zone_blocked";

export type ParkingAvailability = "yes" | "no" | "unknown";

export type BookingVehicle = {
  id: string;
  make: string;
  model: string;
  size: VehicleSize | "";
  addons: AddonId[];
};

export type BookingDraft = {
  packageId: PackageId | "";
  vehicles: BookingVehicle[];
  postcode: string;
  fullAddress: string;
  parkingAvailable: ParkingAvailability | "";
  parkingNotes: string;
  accessNotes: string;
  zoneCheckStatus: ZoneCheckStatus;
  vehicleCount: number;
  selectedDate: string;
  selectedSlotStart: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  extraNotes: string;
  marketingPhotoConsent: boolean;
};
