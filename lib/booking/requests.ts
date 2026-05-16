import { createUtcDateFromBusinessTime } from "../availability";
import { isValidDateString, isValidTimeString } from "../availability/working-hours";
import { calculateBookingDuration, calculateBookingPrice } from "../pricing";
import type { DurationBreakdown, PriceBreakdown } from "../pricing";
import { DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT } from "../zones";
import { assertBookingTransition } from "./lifecycle";
import type { BookingDraft, BookingVehicle } from "./types";

export type BookingRequestSnapshot = {
  bookingReference: string;
  status: "pending_admin_review";
  requestedStartAt: string;
  serviceEndsAt: string;
  blockedUntil: string;
  price: PriceBreakdown;
  duration: DurationBreakdown;
};

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function isBusinessDateTimeInPast(date: string, time: string, now = new Date()) {
  if (!isValidDateString(date) || !isValidTimeString(time)) {
    return false;
  }

  return createUtcDateFromBusinessTime(date, time).getTime() <= now.getTime();
}

function getPrimaryVehicle(draft: BookingDraft) {
  return draft.vehicles[0];
}

function validatePrimaryVehicle(vehicle: BookingVehicle | undefined) {
  const errors: string[] = [];

  if (!vehicle) {
    return ["Add a vehicle before submitting the booking request."];
  }

  if (!vehicle.make.trim()) errors.push("Enter the vehicle make.");
  if (!vehicle.model.trim()) errors.push("Enter the vehicle model.");
  if (!vehicle.size) errors.push("Choose the closest vehicle size.");

  return errors;
}

export function validateBookingDraftForRequest(draft: BookingDraft) {
  const errors: string[] = [];
  const primaryVehicle = getPrimaryVehicle(draft);

  if (!draft.packageId) errors.push("Choose Maintenance or Deep Clean.");
  errors.push(...validatePrimaryVehicle(primaryVehicle));
  if (!draft.postcode.trim()) errors.push("Enter the service postcode or area.");
  if (!draft.fullAddress.trim()) errors.push("Enter the full service address.");
  if (!draft.parkingAvailable) errors.push("Choose whether suitable parking is available.");
  if (!draft.accessToWaterAvailable) errors.push("Confirm water access is available.");
  if (!draft.accessToElectricityAvailable) errors.push("Confirm electricity access is available.");
  if (!draft.accessibleParkingLocation) errors.push("Confirm the vehicle is in an accessible parking location.");
  if (draft.zoneCheckStatus === "unchecked") errors.push("Check the service area before submitting.");
  if (draft.vehicleCount < 1) errors.push("Choose at least one vehicle.");

  if (
    draft.zoneCheckStatus === "outside_zone_blocked" &&
    draft.vehicleCount < DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT
  ) {
    errors.push("Outside-zone requests need 3+ vehicles at the same address.");
  }

  if (!draft.selectedDate) {
    errors.push("Choose a preferred date.");
  } else if (!isValidDateString(draft.selectedDate)) {
    errors.push("Choose a valid preferred date.");
  }

  if (!draft.selectedSlotStart) {
    errors.push("Choose a preferred time.");
  } else if (!isValidTimeString(draft.selectedSlotStart)) {
    errors.push("Choose a valid preferred time.");
  } else if (draft.selectedDate && isBusinessDateTimeInPast(draft.selectedDate, draft.selectedSlotStart)) {
    errors.push("Choose a future preferred time.");
  }

  if (
    draft.zoneCheckStatus === "outside_zone_volume_allowed" &&
    draft.vehicleCount < DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT
  ) {
    errors.push("Outside-zone requests need 3+ vehicles at the same address.");
  }

  if (!draft.customer.fullName.trim()) errors.push("Enter your full name.");
  if (!draft.customer.phone.trim()) errors.push("Enter your phone number.");
  if (!draft.customer.email.trim()) errors.push("Enter your email address.");
  if (draft.customer.email.trim() && !isValidEmail(draft.customer.email)) {
    errors.push("Enter a valid email address.");
  }

  return errors;
}

export function createBookingRequestSnapshot({
  bookingReference,
  draft,
  price: inputPrice,
  duration: inputDuration,
}: {
  bookingReference: string;
  draft: BookingDraft;
  price?: PriceBreakdown;
  duration?: DurationBreakdown;
}): BookingRequestSnapshot {
  assertBookingTransition("zone_validated", "pending_admin_review", {
    actor: "customer",
    reason: "booking request submitted without payment",
  });

  const price = inputPrice ?? calculateBookingPrice(draft, { paymentsEnabled: false });
  const duration = inputDuration ?? calculateBookingDuration(draft);
  const requestedStart = createUtcDateFromBusinessTime(draft.selectedDate, draft.selectedSlotStart);
  const serviceEndsAt = new Date(requestedStart.getTime() + duration.serviceDurationMinutes * 60_000);
  const blockedUntil = new Date(requestedStart.getTime() + duration.blockedDurationMinutes * 60_000);

  return {
    bookingReference,
    status: "pending_admin_review",
    requestedStartAt: requestedStart.toISOString(),
    serviceEndsAt: serviceEndsAt.toISOString(),
    blockedUntil: blockedUntil.toISOString(),
    price,
    duration,
  };
}
