import { hasOverlap } from "../availability/conflicts";
import type { AddonId, BookingStatus, PackageId, VehicleSize } from "../booking/types";
import { getAdminBookingStatusLabel } from "../booking/status-labels";
import { getBookingDetailRecord, type BookingDetailRecord } from "../db/booking-repository";
import { isDatabaseConfigured } from "../db/postgres";
import {
  addonDefinitions,
  formatMoneyGBP,
  getServicePackage,
  vehicleSizeLabels,
} from "../pricing";

export type ApprovalCheckState = "success" | "warning" | "danger" | "neutral";

export type ApprovalCheck = {
  label: string;
  state: ApprovalCheckState;
  message?: string;
};

export type AdminBookingDetailData = {
  id: string;
  reference: string;
  status: BookingStatus;
  statusLabel: string;
  requestedDateLabel: string;
  requestedTimeLabel: string;
  serviceEndLabel: string;
  blockedUntilLabel: string;
  serviceLabel: string;
  packageId: PackageId;
  vehicle: {
    make: string;
    model: string;
    size: VehicleSize;
    label: string;
  };
  addons: {
    id: AddonId;
    label: string;
    priceLabel: string;
  }[];
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  location: {
    fullAddress: string;
    postcode: string;
    zoneLabel: string;
    isOutsideZone: boolean;
    parkingAvailable: string;
    accessToWaterAvailable: boolean;
    accessToElectricityAvailable: boolean;
    accessibleParkingLocation: boolean;
    parkingNotes?: string;
    accessNotes?: string;
  };
  payment: {
    depositPaidLabel: string;
    estimatedTotalLabel: string;
    finalTotalLabel?: string;
    balanceDueLabel: string;
    paymentStatusLabel: string;
  };
  financials: {
    estimatedTotalMinor: number;
    finalTotalMinor: number | null;
    depositPaidMinor: number;
    balancePaidMinor: number;
    balanceDueMinor: number;
  };
  notes: {
    customerNotes?: string;
    adminNotes?: string;
  };
  checks: ApprovalCheck[];
  actions: {
    canApprove: boolean;
    canDecline: boolean;
    canReschedule: boolean;
    canCancel: boolean;
    canAdjustPrice: boolean;
    canMarkBalancePaid: boolean;
  };
  activity: {
    id: string;
    label: string;
    atLabel: string;
    actorLabel?: string;
  }[];
  schedule: {
    requestedStartAt: string;
    blockedUntil: string;
  };
};

export const adminBookingDetailUsesMockData = false;

type MockBookingSeed = {
  id: string;
  reference: string;
  status: BookingStatus;
  packageId: PackageId;
  vehicleSize: VehicleSize;
  make: string;
  model: string;
  addonIds: AddonId[];
  requestedDateLabel: string;
  requestedTimeLabel: string;
  serviceEndLabel: string;
  blockedUntilLabel: string;
  isOutsideZone: boolean;
  parkingAvailable: "Yes" | "No" | "Unknown";
  estimatedTotalMinor: number;
  finalTotalMinor: number | null;
  depositPaidMinor: number;
  balancePaidMinor: number;
  balanceDueMinor: number;
  requestedStartAt: string;
  blockedUntil: string;
};

const mockSeeds: Record<string, MockBookingSeed> = {
  "mock-request-1": {
    id: "mock-request-1",
    reference: "AV-2026-DEMO1",
    status: "pending_admin_review",
    packageId: "deep_clean",
    vehicleSize: "medium",
    make: "BMW",
    model: "3 Series",
    addonIds: ["engine_bay_clean", "excess_pet_hair_removal"],
    requestedDateLabel: "Mon 18 May",
    requestedTimeLabel: "11:45",
    serviceEndLabel: "15:50",
    blockedUntilLabel: "16:35",
    isOutsideZone: false,
    parkingAvailable: "Yes",
    estimatedTotalMinor: 22500,
    finalTotalMinor: null,
    depositPaidMinor: 3000,
    balancePaidMinor: 0,
    balanceDueMinor: 19500,
    requestedStartAt: "2026-05-18T10:45:00.000Z",
    blockedUntil: "2026-05-18T15:35:00.000Z",
  },
  "mock-request-2": {
    id: "mock-request-2",
    reference: "AV-2026-DEMO2",
    status: "pending_admin_review",
    packageId: "maintenance",
    vehicleSize: "large_4x4",
    make: "Range Rover",
    model: "Sport",
    addonIds: ["liquid_decon_clay_bar"],
    requestedDateLabel: "Mon 18 May",
    requestedTimeLabel: "14:15",
    serviceEndLabel: "16:35",
    blockedUntilLabel: "17:20",
    isOutsideZone: true,
    parkingAvailable: "Unknown",
    estimatedTotalMinor: 12500,
    finalTotalMinor: null,
    depositPaidMinor: 3000,
    balancePaidMinor: 0,
    balanceDueMinor: 9500,
    requestedStartAt: "2026-05-18T13:15:00.000Z",
    blockedUntil: "2026-05-18T16:20:00.000Z",
  },
  "mock-request-3": {
    id: "mock-request-3",
    reference: "AV-2026-DEMO3",
    status: "payment_hold",
    packageId: "maintenance",
    vehicleSize: "small",
    make: "Audi",
    model: "A3",
    addonIds: [],
    requestedDateLabel: "Tue 19 May",
    requestedTimeLabel: "09:00",
    serviceEndLabel: "10:00",
    blockedUntilLabel: "10:45",
    isOutsideZone: false,
    parkingAvailable: "Yes",
    estimatedTotalMinor: 5500,
    finalTotalMinor: null,
    depositPaidMinor: 0,
    balancePaidMinor: 0,
    balanceDueMinor: 5500,
    requestedStartAt: "2026-05-19T08:00:00.000Z",
    blockedUntil: "2026-05-19T09:45:00.000Z",
  },
  "mock-request-5": {
    id: "mock-request-5",
    reference: "AV-2026-DEMO5",
    status: "approved",
    packageId: "maintenance",
    vehicleSize: "medium",
    make: "Volkswagen",
    model: "Golf",
    addonIds: ["windscreen_repellent"],
    requestedDateLabel: "Wed 20 May",
    requestedTimeLabel: "10:30",
    serviceEndLabel: "12:00",
    blockedUntilLabel: "12:45",
    isOutsideZone: false,
    parkingAvailable: "Yes",
    estimatedTotalMinor: 9500,
    finalTotalMinor: null,
    depositPaidMinor: 3000,
    balancePaidMinor: 0,
    balanceDueMinor: 6500,
    requestedStartAt: "2026-05-20T09:30:00.000Z",
    blockedUntil: "2026-05-20T11:45:00.000Z",
  },
  "mock-request-4": {
    id: "mock-request-4",
    reference: "AV-2026-DEMO4",
    status: "reschedule_requested",
    packageId: "deep_clean",
    vehicleSize: "large_4x4",
    make: "Mercedes",
    model: "GLC",
    addonIds: ["leather_deep_clean"],
    requestedDateLabel: "Fri 22 May",
    requestedTimeLabel: "15:00",
    serviceEndLabel: "19:30",
    blockedUntilLabel: "20:15",
    isOutsideZone: false,
    parkingAvailable: "Yes",
    estimatedTotalMinor: 22000,
    finalTotalMinor: null,
    depositPaidMinor: 3000,
    balancePaidMinor: 0,
    balanceDueMinor: 19000,
    requestedStartAt: "2026-05-22T14:00:00.000Z",
    blockedUntil: "2026-05-22T19:15:00.000Z",
  },
  "mock-request-6": {
    id: "mock-request-6",
    reference: "AV-2026-DEMO6",
    status: "declined",
    packageId: "deep_clean",
    vehicleSize: "large_4x4",
    make: "Ford",
    model: "Kuga",
    addonIds: [],
    requestedDateLabel: "Mon 11 May",
    requestedTimeLabel: "13:00",
    serviceEndLabel: "16:30",
    blockedUntilLabel: "17:15",
    isOutsideZone: true,
    parkingAvailable: "Unknown",
    estimatedTotalMinor: 17000,
    finalTotalMinor: null,
    depositPaidMinor: 3000,
    balancePaidMinor: 0,
    balanceDueMinor: 14000,
    requestedStartAt: "2026-05-11T12:00:00.000Z",
    blockedUntil: "2026-05-11T16:15:00.000Z",
  },
  "booking-demo-1": {
    id: "booking-demo-1",
    reference: "AV-2026-DEMO1",
    status: "pending_admin_review",
    packageId: "deep_clean",
    vehicleSize: "large_4x4",
    make: "Range Rover",
    model: "Evoque",
    addonIds: ["engine_bay_clean"],
    requestedDateLabel: "Mon 18 May",
    requestedTimeLabel: "11:45",
    serviceEndLabel: "15:35",
    blockedUntilLabel: "16:20",
    isOutsideZone: false,
    parkingAvailable: "Yes",
    estimatedTotalMinor: 22000,
    finalTotalMinor: null,
    depositPaidMinor: 3000,
    balancePaidMinor: 0,
    balanceDueMinor: 19000,
    requestedStartAt: "2026-05-18T10:45:00.000Z",
    blockedUntil: "2026-05-18T15:20:00.000Z",
  },
  "booking-demo-2": {
    id: "booking-demo-2",
    reference: "AV-2026-DEMO2",
    status: "approved",
    packageId: "maintenance",
    vehicleSize: "medium",
    make: "BMW",
    model: "3 Series",
    addonIds: ["windscreen_repellent"],
    requestedDateLabel: "Wed 20 May",
    requestedTimeLabel: "10:30",
    serviceEndLabel: "12:00",
    blockedUntilLabel: "12:45",
    isOutsideZone: true,
    parkingAvailable: "Unknown",
    estimatedTotalMinor: 9500,
    finalTotalMinor: null,
    depositPaidMinor: 3000,
    balancePaidMinor: 0,
    balanceDueMinor: 6500,
    requestedStartAt: "2026-05-20T09:30:00.000Z",
    blockedUntil: "2026-05-20T11:45:00.000Z",
  },
  "booking-demo-3": {
    id: "booking-demo-3",
    reference: "AV-2026-DEMO3",
    status: "expired",
    packageId: "deep_clean",
    vehicleSize: "large_4x4",
    make: "Audi",
    model: "Q5",
    addonIds: [],
    requestedDateLabel: "Tue 12 May",
    requestedTimeLabel: "09:00",
    serviceEndLabel: "12:30",
    blockedUntilLabel: "13:15",
    isOutsideZone: true,
    parkingAvailable: "Unknown",
    estimatedTotalMinor: 17000,
    finalTotalMinor: null,
    depositPaidMinor: 0,
    balancePaidMinor: 0,
    balanceDueMinor: 17000,
    requestedStartAt: "2026-05-12T08:00:00.000Z",
    blockedUntil: "2026-05-12T12:15:00.000Z",
  },
  "booking-demo-4": {
    id: "booking-demo-4",
    reference: "AV-2026-0042",
    status: "completed",
    packageId: "maintenance",
    vehicleSize: "small",
    make: "Mini",
    model: "Cooper",
    addonIds: [],
    requestedDateLabel: "Wed 22 Apr",
    requestedTimeLabel: "09:00",
    serviceEndLabel: "10:00",
    blockedUntilLabel: "10:45",
    isOutsideZone: false,
    parkingAvailable: "Yes",
    estimatedTotalMinor: 5500,
    finalTotalMinor: 5500,
    depositPaidMinor: 3000,
    balancePaidMinor: 2500,
    balanceDueMinor: 0,
    requestedStartAt: "2026-04-22T08:00:00.000Z",
    blockedUntil: "2026-04-22T09:45:00.000Z",
  },
};

function getMockSeed(id: string) {
  return mockSeeds[id] ?? null;
}

function buildAddonDetails(addonIds: AddonId[]) {
  return addonIds.map((addonId) => {
    const addon = addonDefinitions[addonId];

    return {
      id: addon.id,
      label: addon.label,
      priceLabel: formatMoneyGBP(addon.priceMinor),
    };
  });
}

function getActionsForStatus(status: BookingStatus, balanceDueMinor: number) {
  const isPending = status === "pending_admin_review";
  const canCancel =
    status === "approved" ||
    status === "on_the_way" ||
    status === "arrived" ||
    status === "in_progress";
  const canAdjustPrice = canCancel || status === "completed";
  const canMarkBalancePaid = canAdjustPrice && balanceDueMinor > 0;

  return {
    canApprove: isPending,
    canDecline: isPending,
    canReschedule: isPending || status === "approved" || status === "reschedule_requested",
    canCancel,
    canAdjustPrice,
    canMarkBalancePaid,
  };
}

function hasMockCalendarClash() {
  const requestedStart = new Date("2026-05-18T10:45:00.000Z");
  const blockedUntil = new Date("2026-05-18T15:35:00.000Z");
  const existingStart = new Date("2026-05-18T07:30:00.000Z");
  const existingBlockedUntil = new Date("2026-05-18T10:45:00.000Z");

  return hasOverlap(requestedStart, blockedUntil, existingStart, existingBlockedUntil);
}

function buildApprovalChecks(seed: MockBookingSeed): ApprovalCheck[] {
  const conflictDetected = hasMockCalendarClash();
  const customerComplete = true;
  const vehicleComplete = Boolean(seed.make && seed.model && seed.vehicleSize);

  return [
    {
      label: "Request received",
      state: "success",
      message: "Customer submitted this request without online payment.",
    },
    {
      label: "No calendar clash",
      state: conflictDetected ? "danger" : "success",
      message: conflictDetected
        ? "This requested time overlaps another blocking booking."
        : "No clash found in the current placeholder check.",
    },
    {
      label: "Service area",
      state: seed.isOutsideZone ? "warning" : "success",
      message: seed.isOutsideZone
        ? "Outside-zone request: check vehicle count and location before approval."
        : "Location is inside the standard service zone.",
    },
    {
      label: "Customer details complete",
      state: customerComplete ? "success" : "danger",
      message: customerComplete ? "Name, phone and email are present." : "Customer details are incomplete.",
    },
    {
      label: "Vehicle details complete",
      state: vehicleComplete ? "success" : "danger",
      message: vehicleComplete ? "Make, model and size are present." : "Vehicle details are incomplete.",
    },
    {
      label: "Service duration calculated",
      state: "success",
      message: `Service runs until ${seed.serviceEndLabel}; calendar is blocked until ${seed.blockedUntilLabel}.`,
    },
    {
      label: "Parking/access details reviewed",
      state: seed.parkingAvailable === "Yes" ? "success" : "warning",
      message:
        seed.parkingAvailable === "Yes"
          ? "Parking is marked as available."
          : "Parking or access may need admin review.",
    },
    {
      label: "Price may vary notice",
      state: "neutral",
      message: "Customer estimate may change depending on condition on arrival.",
    },
  ];
}

function formatDateLabel(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Date missing";
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTimeLabel(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Time missing";
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function getZoneLabel(zoneStatus: BookingDetailRecord["zoneStatus"]) {
  if (zoneStatus === "outside_zone_volume_exception") return "Outside-zone request";
  if (zoneStatus === "outside_service_area") return "Outside service area";

  return "Standard service zone";
}

function getParkingLabel(parkingAvailable: BookingDetailRecord["parkingAvailable"]) {
  if (parkingAvailable === "yes") return "Yes";
  if (parkingAvailable === "no") return "No";

  return "Unknown";
}

function buildRecordApprovalChecks(record: BookingDetailRecord): ApprovalCheck[] {
  const customerComplete = Boolean(
    record.customerName.trim() && record.customerPhone.trim() && record.customerEmail.trim(),
  );
  const vehicleComplete = Boolean(record.vehicleMake.trim() && record.vehicleModel.trim() && record.vehicleSize);
  const isOutsideZone = record.zoneStatus !== "standard_zone";
  const accessRequirementsConfirmed =
    record.parkingAvailable === "yes" &&
    record.accessToWaterAvailable &&
    record.accessToElectricityAvailable &&
    record.accessibleParkingLocation;

  return [
    {
      label: "Request received",
      state: "success",
      message: "Customer submitted this request without online payment.",
    },
    {
      label: "Calendar re-check",
      state: "neutral",
      message: "Approval re-checks live calendar conflicts before saving.",
    },
    {
      label: "Service area",
      state: isOutsideZone ? "warning" : "success",
      message: isOutsideZone
        ? "Outside-zone request: check vehicle count and location before approval."
        : "Location is inside the standard service zone.",
    },
    {
      label: "Customer details complete",
      state: customerComplete ? "success" : "danger",
      message: customerComplete ? "Name, phone and email are present." : "Customer details are incomplete.",
    },
    {
      label: "Vehicle details complete",
      state: vehicleComplete ? "success" : "danger",
      message: vehicleComplete ? "Make, model and size are present." : "Vehicle details are incomplete.",
    },
    {
      label: "Service duration calculated",
      state: record.serviceDurationMinutes > 0 ? "success" : "danger",
      message: `Service runs until ${formatTimeLabel(record.serviceEndsAt)}; calendar is blocked until ${formatTimeLabel(record.blockedUntil)}.`,
    },
    {
      label: "Parking/access details reviewed",
      state: accessRequirementsConfirmed ? "success" : "warning",
      message:
        accessRequirementsConfirmed
          ? "Parking, water, electricity and vehicle access are confirmed."
          : "Parking, water, electricity or vehicle access may need admin review.",
    },
    {
      label: "Price may vary notice",
      state: "neutral",
      message: "Customer estimate may change depending on condition on arrival.",
    },
  ];
}

function buildRecordAddonDetails(record: BookingDetailRecord) {
  const addonIds = [...new Set(record.addons.map((addon) => addon.id))];

  return addonIds.map((addonId) => {
    const addon = addonDefinitions[addonId];

    return {
      id: addon.id,
      label: addon.label,
      priceLabel: formatMoneyGBP(addon.priceMinor),
    };
  });
}

function buildDetailFromRecord(record: BookingDetailRecord): AdminBookingDetailData {
  const service = getServicePackage(record.packageId);
  const primaryVehicle = record.vehicles.find((vehicle) => vehicle.isPrimary) ?? record.vehicles[0];
  const vehicleMake = primaryVehicle?.make || record.vehicleMake;
  const vehicleModel = primaryVehicle?.model || record.vehicleModel;
  const vehicleSize = primaryVehicle?.size || record.vehicleSize;
  const finalTotalLabel = record.finalTotalMinor === null ? undefined : formatMoneyGBP(record.finalTotalMinor);
  const zoneLabel = getZoneLabel(record.zoneStatus);

  return {
    id: record.id,
    reference: record.reference,
    status: record.status,
    statusLabel: getAdminBookingStatusLabel(record.status),
    requestedDateLabel: formatDateLabel(record.requestedStartAt),
    requestedTimeLabel: formatTimeLabel(record.requestedStartAt),
    serviceEndLabel: formatTimeLabel(record.serviceEndsAt),
    blockedUntilLabel: formatTimeLabel(record.blockedUntil),
    serviceLabel: service.label,
    packageId: record.packageId,
    vehicle: {
      make: vehicleMake,
      model: vehicleModel,
      size: vehicleSize,
      label: `${vehicleMake} ${vehicleModel} · ${vehicleSizeLabels[vehicleSize]}`,
    },
    addons: buildRecordAddonDetails(record),
    customer: {
      fullName: record.customerName,
      phone: record.customerPhone,
      email: record.customerEmail,
    },
    location: {
      fullAddress: record.fullAddress,
      postcode: record.postcode,
      zoneLabel,
      isOutsideZone: record.zoneStatus !== "standard_zone",
      parkingAvailable: getParkingLabel(record.parkingAvailable),
      accessToWaterAvailable: record.accessToWaterAvailable,
      accessToElectricityAvailable: record.accessToElectricityAvailable,
      accessibleParkingLocation: record.accessibleParkingLocation,
      parkingNotes: record.parkingNotes,
      accessNotes: record.accessNotes,
    },
    payment: {
      depositPaidLabel: formatMoneyGBP(record.depositPaidMinor),
      estimatedTotalLabel: formatMoneyGBP(record.estimatedTotalMinor),
      finalTotalLabel,
      balanceDueLabel: formatMoneyGBP(record.balanceDueMinor),
      paymentStatusLabel: "No online payment",
    },
    financials: {
      estimatedTotalMinor: record.estimatedTotalMinor,
      finalTotalMinor: record.finalTotalMinor,
      depositPaidMinor: record.depositPaidMinor,
      balancePaidMinor: record.balancePaidMinor,
      balanceDueMinor: record.balanceDueMinor,
    },
    notes: {
      customerNotes: record.extraNotes,
      adminNotes: record.adminNotes,
    },
    checks: buildRecordApprovalChecks(record),
    actions: getActionsForStatus(record.status, record.balanceDueMinor),
    activity: [
      {
        id: "activity-request-created",
        label: "Booking request submitted",
        atLabel: formatDateLabel(record.createdAt),
        actorLabel: "Customer",
      },
      ...(record.approvedAt
        ? [
            {
              id: "activity-approved",
              label: "Booking approved",
              atLabel: formatDateLabel(record.approvedAt),
              actorLabel: "Admin",
            },
          ]
        : []),
      ...(record.declinedAt
        ? [
            {
              id: "activity-declined",
              label: "Booking declined",
              atLabel: formatDateLabel(record.declinedAt),
              actorLabel: "Admin",
            },
          ]
        : []),
    ],
    schedule: {
      requestedStartAt: record.requestedStartAt,
      blockedUntil: record.blockedUntil,
    },
  };
}

export async function getAdminBookingDetail(id: string): Promise<AdminBookingDetailData | null> {
  if (isDatabaseConfigured()) {
    const record = await getBookingDetailRecord(id);

    return record ? buildDetailFromRecord(record) : null;
  }

  return null;
}

function buildMockBookingDetail(seed: MockBookingSeed): AdminBookingDetailData {
  const service = getServicePackage(seed.packageId);
  return {
    id: seed.id,
    reference: seed.reference,
    status: seed.status,
    statusLabel: getAdminBookingStatusLabel(seed.status),
    requestedDateLabel: seed.requestedDateLabel,
    requestedTimeLabel: seed.requestedTimeLabel,
    serviceEndLabel: seed.serviceEndLabel,
    blockedUntilLabel: seed.blockedUntilLabel,
    serviceLabel: service.label,
    packageId: seed.packageId,
    vehicle: {
      make: seed.make,
      model: seed.model,
      size: seed.vehicleSize,
      label: `${seed.make} ${seed.model} · ${vehicleSizeLabels[seed.vehicleSize]}`,
    },
    addons: buildAddonDetails(seed.addonIds),
    customer: {
      fullName: "Example customer",
      phone: "07123 000000",
      email: "customer@example.com",
    },
    location: {
      fullAddress: seed.isOutsideZone ? "Outside-zone address placeholder" : "10 Example Road, Croydon",
      postcode: seed.isOutsideZone ? "BR3 3AA" : "CR0 1AA",
      zoneLabel: seed.isOutsideZone ? "Outside-zone request" : "Standard service zone",
      isOutsideZone: seed.isOutsideZone,
      parkingAvailable: seed.parkingAvailable,
      accessToWaterAvailable: true,
      accessToElectricityAvailable: true,
      accessibleParkingLocation: seed.parkingAvailable === "Yes",
      parkingNotes: seed.parkingAvailable === "Yes" ? "Driveway available." : "Customer is unsure about parking.",
      accessNotes: seed.isOutsideZone ? "Check travel time and vehicle count before approval." : "Vehicle accessible from driveway.",
    },
    payment: {
      depositPaidLabel: formatMoneyGBP(seed.depositPaidMinor),
      estimatedTotalLabel: formatMoneyGBP(seed.estimatedTotalMinor),
      finalTotalLabel: seed.finalTotalMinor === null ? undefined : formatMoneyGBP(seed.finalTotalMinor),
      balanceDueLabel: formatMoneyGBP(seed.balanceDueMinor),
      paymentStatusLabel: "No online payment",
    },
    financials: {
      estimatedTotalMinor: seed.estimatedTotalMinor,
      finalTotalMinor: seed.finalTotalMinor,
      depositPaidMinor: seed.depositPaidMinor,
      balancePaidMinor: seed.balancePaidMinor,
      balanceDueMinor: seed.balanceDueMinor,
    },
    notes: {
      customerNotes: seed.isOutsideZone
        ? "Customer mentioned 3 vehicles may be available at the same address."
        : "Customer noted light pet hair in the rear seats.",
      adminNotes: "Placeholder detail record. Replace with database notes before launch.",
    },
    checks: buildApprovalChecks(seed),
    actions: getActionsForStatus(seed.status, seed.balanceDueMinor),
    activity: [
      {
        id: "activity-1",
        label: seed.status === "payment_hold" ? "Payment hold created" : "Booking request submitted",
        atLabel: "Today",
        actorLabel: "Customer",
      },
      {
        id: "activity-2",
        label: "Booking request loaded for admin review",
        atLabel: "Just now",
        actorLabel: "Admin app",
      },
    ],
    schedule: {
      requestedStartAt: seed.requestedStartAt,
      blockedUntil: seed.blockedUntil,
    },
  };
}
