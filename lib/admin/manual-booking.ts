import type {
  AddonId,
  BookingDraft,
  BookingSource,
  BookingStatus,
  PackageId,
  ParkingAvailability,
  VehicleSize,
} from "../booking/types";
import { createBookingReference } from "../booking/references";
import { arePaymentsEnabled } from "../config/features";
import type { CalendarBlockingBooking } from "../availability";
import { createUtcDateFromBusinessTime, generateAvailableSlots } from "../availability";
import { isValidDateString, isValidTimeString } from "../availability/working-hours";
import { normalizePostcode } from "../zones/normalize-postcode";
import { validateServiceZone } from "../zones/validate-zone";
import type { ZoneValidationOptions, ZoneValidationResult } from "../zones";
import { addonDefinitions, calculateBookingDuration, calculateBookingPrice, servicePackages } from "../pricing";
import type { DurationBreakdown, PriceBreakdown } from "../pricing";
import type { AvailabilityOverride, WorkingHoursRule } from "../availability";

export type ManualBookingSource = Exclude<BookingSource, "public_booking">;

export type ManualBookingStatus = Extract<BookingStatus, "pending_admin_review" | "approved">;

export type ManualDepositStatus = "unpaid" | "paid" | "waived";

export type ManualPaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card_reader"
  | "online_payment_link"
  | "other";

export type CreateManualBookingInput = {
  source: ManualBookingSource;
  status: ManualBookingStatus;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  vehicle: {
    make: string;
    model: string;
    size: VehicleSize | "";
  };
  service: {
    packageId: PackageId | "";
    addons: AddonId[];
    vehicleCount: number;
  };
  location: {
    postcode: string;
    fullAddress: string;
    parkingAvailable: ParkingAvailability | "";
    parkingNotes: string;
    accessNotes: string;
  };
  schedule: {
    date: string;
    startTime: string;
  };
  payment: {
    depositStatus: ManualDepositStatus;
    depositPaidMinor: number;
    paymentMethod: ManualPaymentMethod;
    notes: string;
  };
};

export type ManualBookingPreview = {
  bookingReference: string;
  normalizedPostcode: string;
  zoneResult: ZoneValidationResult;
  price: PriceBreakdown;
  duration: DurationBreakdown;
  requestedStartAt: string;
  serviceEndsAt: string;
  blockedUntil: string;
  slotAvailable: boolean;
};

export type CreateManualBookingResult =
  | {
      success: true;
      bookingId: string;
      bookingReference: string;
      status: BookingStatus;
    }
  | {
      success: false;
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

export type CreateManualBookingOptions = {
  adminAuthenticated?: boolean;
  canCreateManualBooking?: boolean;
  persistenceConfigured?: boolean;
  existingBookings?: CalendarBlockingBooking[];
  workingHoursRules?: WorkingHoursRule[];
  availabilityOverrides?: AvailabilityOverride[];
};

type ParsedManualBookingInput =
  | {
      input: CreateManualBookingInput;
      errors: string[];
    }
  | {
      input: null;
      errors: string[];
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown, fallback = 0) {
  const numberValue = typeof value === "number" ? value : Number(value ?? fallback);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function readIntegerOrNull(value: unknown) {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!/^-?\d+$/.test(normalized)) {
    return null;
  }

  const numberValue = Number(normalized);

  return Number.isSafeInteger(numberValue) ? numberValue : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isVehicleSize(value: unknown): value is VehicleSize {
  return value === "small" || value === "medium" || value === "large_4x4";
}

function isPackageId(value: unknown): value is PackageId {
  return typeof value === "string" && value in servicePackages;
}

function isAddonId(value: unknown): value is AddonId {
  return typeof value === "string" && value in addonDefinitions;
}

function isParkingAvailability(value: unknown): value is ParkingAvailability {
  return value === "yes" || value === "no" || value === "unknown";
}

function isManualBookingSource(value: unknown): value is ManualBookingSource {
  return (
    value === "admin_manual" ||
    value === "phone" ||
    value === "instagram" ||
    value === "whatsapp" ||
    value === "referral"
  );
}

function isManualBookingStatus(value: unknown): value is ManualBookingStatus {
  return value === "pending_admin_review" || value === "approved";
}

function isManualDepositStatus(value: unknown): value is ManualDepositStatus {
  return value === "unpaid" || value === "paid" || value === "waived";
}

function isManualPaymentMethod(value: unknown): value is ManualPaymentMethod {
  return (
    value === "cash" ||
    value === "bank_transfer" ||
    value === "card_reader" ||
    value === "online_payment_link" ||
    value === "other"
  );
}

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function isScheduledStartInPast(date: string, time: string, now = new Date()) {
  if (!isValidDateString(date) || !isValidTimeString(time)) {
    return false;
  }

  return createUtcDateFromBusinessTime(date, time).getTime() <= now.getTime();
}

export function parseCreateManualBookingInput(value: unknown): ParsedManualBookingInput {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      input: null,
      errors: ["Manual booking payload is required."],
    };
  }

  const customer = isRecord(value.customer) ? value.customer : {};
  const vehicle = isRecord(value.vehicle) ? value.vehicle : {};
  const service = isRecord(value.service) ? value.service : {};
  const location = isRecord(value.location) ? value.location : {};
  const schedule = isRecord(value.schedule) ? value.schedule : {};
  const payment = isRecord(value.payment) ? value.payment : {};
  const addons = readStringArray(service.addons);
  const depositPaidMinor = readIntegerOrNull(payment.depositPaidMinor);

  if (value.source && !isManualBookingSource(value.source)) errors.push("Booking source is invalid.");
  if (value.status && !isManualBookingStatus(value.status)) errors.push("Manual booking status is invalid.");
  if (vehicle.size && !isVehicleSize(vehicle.size)) errors.push("Vehicle size is invalid.");
  if (service.packageId && !isPackageId(service.packageId)) errors.push("Service package is invalid.");
  if (addons.some((addon) => !isAddonId(addon))) errors.push("One or more add-ons are invalid.");
  if (location.parkingAvailable && !isParkingAvailability(location.parkingAvailable)) {
    errors.push("Parking availability is invalid.");
  }
  if (payment.depositStatus && !isManualDepositStatus(payment.depositStatus)) {
    errors.push("Deposit status is invalid.");
  }
  if (payment.paymentMethod && !isManualPaymentMethod(payment.paymentMethod)) {
    errors.push("Payment method is invalid.");
  }
  if (payment.depositPaidMinor !== undefined && depositPaidMinor === null) {
    errors.push("Deposit paid must be an integer minor-unit amount.");
  }

  return {
    input: {
      source: isManualBookingSource(value.source) ? value.source : "admin_manual",
      status: isManualBookingStatus(value.status) ? value.status : "pending_admin_review",
      customer: {
        fullName: readString(customer.fullName),
        phone: readString(customer.phone),
        email: readString(customer.email),
      },
      vehicle: {
        make: readString(vehicle.make),
        model: readString(vehicle.model),
        size: isVehicleSize(vehicle.size) ? vehicle.size : "",
      },
      service: {
        packageId: isPackageId(service.packageId) ? service.packageId : "",
        addons: addons.filter(isAddonId),
        vehicleCount: Math.max(Math.floor(readNumber(service.vehicleCount, 1)), 1),
      },
      location: {
        postcode: readString(location.postcode),
        fullAddress: readString(location.fullAddress),
        parkingAvailable: isParkingAvailability(location.parkingAvailable) ? location.parkingAvailable : "",
        parkingNotes: readString(location.parkingNotes),
        accessNotes: readString(location.accessNotes),
      },
      schedule: {
        date: readString(schedule.date),
        startTime: readString(schedule.startTime),
      },
      payment: {
        depositStatus: isManualDepositStatus(payment.depositStatus) ? payment.depositStatus : "unpaid",
        depositPaidMinor: Math.max(depositPaidMinor ?? 0, 0),
        paymentMethod: isManualPaymentMethod(payment.paymentMethod) ? payment.paymentMethod : "other",
        notes: readString(payment.notes),
      },
    },
    errors,
  };
}

export function validateManualBookingInput(input: CreateManualBookingInput) {
  const errors: string[] = [];

  if (!input.customer.fullName.trim()) errors.push("Customer name is required.");
  if (!input.customer.phone.trim()) errors.push("Customer phone is required.");
  if (!input.customer.email.trim()) {
    errors.push("Customer email is required.");
  } else if (!isValidEmail(input.customer.email.trim())) {
    errors.push("Enter a valid customer email.");
  }
  if (!input.vehicle.make.trim()) errors.push("Vehicle make is required.");
  if (!input.vehicle.model.trim()) errors.push("Vehicle model is required.");
  if (!input.vehicle.size) errors.push("Vehicle size is required.");
  if (!input.service.packageId) errors.push("Service package is required.");
  if (input.service.vehicleCount < 1) errors.push("Vehicle count must be at least 1.");
  if (!input.location.postcode.trim()) errors.push("Postcode is required.");
  if (!input.location.fullAddress.trim()) errors.push("Full address is required.");
  if (!input.location.parkingAvailable) errors.push("Parking availability is required.");
  if (!isValidDateString(input.schedule.date)) errors.push("Choose a valid date.");
  if (!isValidTimeString(input.schedule.startTime)) errors.push("Choose a valid start time.");
  if (
    isValidDateString(input.schedule.date) &&
    isValidTimeString(input.schedule.startTime) &&
    isScheduledStartInPast(input.schedule.date, input.schedule.startTime)
  ) {
    errors.push("Choose a future start time.");
  }
  if (arePaymentsEnabled()) {
    if (!Number.isInteger(input.payment.depositPaidMinor) || input.payment.depositPaidMinor < 0) {
      errors.push("Deposit paid must be an integer minor-unit amount of zero or more.");
    }
    if (input.payment.depositStatus === "paid" && input.payment.depositPaidMinor <= 0) {
      errors.push("Enter the deposit amount when the deposit is marked paid.");
    }
    if (input.payment.depositStatus !== "paid" && input.payment.depositPaidMinor > 0) {
      errors.push("Deposit paid amount can only be set when the deposit is marked paid.");
    }
    if (input.status === "approved" && input.payment.depositStatus === "unpaid") {
      errors.push("Approved manual bookings need a paid or waived deposit.");
    }
  }

  return errors;
}

export function buildManualBookingDraft(input: CreateManualBookingInput): BookingDraft {
  return {
    packageId: input.service.packageId,
    vehicles: [
      {
        id: "manual-vehicle-1",
        make: input.vehicle.make,
        model: input.vehicle.model,
        size: input.vehicle.size,
        addons: input.service.addons,
      },
    ],
    postcode: input.location.postcode,
    fullAddress: input.location.fullAddress,
    parkingAvailable: input.location.parkingAvailable,
    parkingNotes: input.location.parkingNotes,
    accessNotes: input.location.accessNotes,
    zoneCheckStatus: "unchecked",
    vehicleCount: input.service.vehicleCount,
    selectedDate: input.schedule.date,
    selectedSlotStart: input.schedule.startTime,
    customer: input.customer,
    extraNotes: "",
    marketingPhotoConsent: false,
  };
}

export function calculateManualBookingPreview(
  input: CreateManualBookingInput,
  existingBookings: CalendarBlockingBooking[] = [],
  availability: {
    workingHoursRules?: WorkingHoursRule[];
    overrides?: AvailabilityOverride[];
    zoneValidationOptions?: ZoneValidationOptions;
  } = {},
): ManualBookingPreview {
  const draft = buildManualBookingDraft(input);
  const normalizedPostcode = normalizePostcode(input.location.postcode);
  const zoneResult = validateServiceZone({
    postcode: normalizedPostcode,
    vehicleCount: input.service.vehicleCount,
  }, availability.zoneValidationOptions);
  const price = calculateBookingPrice(draft);
  const duration = calculateBookingDuration(draft);
  const requestedStart = createUtcDateFromBusinessTime(input.schedule.date, input.schedule.startTime);
  const serviceEndsAt = new Date(requestedStart.getTime() + duration.serviceDurationMinutes * 60_000);
  const blockedUntil = new Date(requestedStart.getTime() + duration.blockedDurationMinutes * 60_000);
  const availableSlots = generateAvailableSlots({
    date: input.schedule.date,
    serviceDurationMinutes: duration.serviceDurationMinutes,
    travelBufferMinutes: duration.travelBufferMinutes,
    workingHoursRules: availability.workingHoursRules,
    overrides: availability.overrides,
    existingBookings,
  });

  return {
    bookingReference: createBookingReference(),
    normalizedPostcode,
    zoneResult,
    price,
    duration,
    requestedStartAt: requestedStart.toISOString(),
    serviceEndsAt: serviceEndsAt.toISOString(),
    blockedUntil: blockedUntil.toISOString(),
    slotAvailable: availableSlots.some((slot) => slot.label === input.schedule.startTime),
  };
}
