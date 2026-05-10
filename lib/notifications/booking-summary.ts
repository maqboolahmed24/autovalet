import type { AdminBookingDetailData } from "../admin/booking-detail";
import type { BookingDraft, ZoneStatus } from "../booking/types";
import {
  formatMoneyGBP,
  getServicePackage,
  vehicleSizeLabels,
} from "../pricing";
import { createAbsoluteUrl } from "../seo/site-config";
import type { NotificationBookingSummary } from "./types";

type BookingSummaryOverride = Partial<NotificationBookingSummary>;

function formatDateLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function getZoneStatusLabel(zoneStatus: ZoneStatus) {
  if (zoneStatus === "outside_zone_volume_exception") return "Outside-zone request";
  if (zoneStatus === "outside_service_area") return "Outside service area";

  return "Standard service zone";
}

export function createPublicBookingStatusUrl(bookingReference: string) {
  return createAbsoluteUrl(`/booking/status/${encodeURIComponent(bookingReference)}`);
}

export function createAdminBookingUrl(bookingId: string) {
  return createAbsoluteUrl(`/admin/bookings/${encodeURIComponent(bookingId)}`);
}

export function buildNotificationSummaryFromAdminBooking(
  booking: AdminBookingDetailData,
  override: BookingSummaryOverride = {},
): NotificationBookingSummary {
  return {
    bookingReference: booking.reference,
    customerName: booking.customer.fullName,
    customerEmail: booking.customer.email,
    customerPhone: booking.customer.phone,
    requestedDate: booking.requestedDateLabel,
    requestedTime: booking.requestedTimeLabel,
    serviceLabel: booking.serviceLabel,
    vehicleLabel: booking.vehicle.label,
    addressSummary: booking.location.postcode,
    estimatedTotal: booking.payment.estimatedTotalLabel,
    depositPaid: booking.payment.depositPaidLabel,
    remainingBalance: booking.payment.balanceDueLabel,
    statusLabel: booking.statusLabel,
    zoneStatusLabel: booking.location.zoneLabel,
    isOutsideZoneRequest: booking.location.isOutsideZone,
    ...override,
  };
}

export function buildNotificationSummaryFromDraft(input: {
  bookingReference: string;
  draft: BookingDraft;
  estimatedTotalMinor: number;
  depositPaidMinor?: number;
  balanceDueMinor?: number;
  zoneStatus: ZoneStatus;
  statusLabel?: string;
}): NotificationBookingSummary {
  const primaryVehicle = input.draft.vehicles[0];
  const primaryVehicleSizeLabel = primaryVehicle?.size
    ? vehicleSizeLabels[primaryVehicle.size]
    : "Vehicle size";
  const vehicleLabel = primaryVehicle
    ? `${primaryVehicle.make} ${primaryVehicle.model} - ${primaryVehicleSizeLabel}`
    : "Vehicle details";
  const depositPaidMinor = input.depositPaidMinor ?? 0;
  const balanceDueMinor = input.balanceDueMinor ?? Math.max(input.estimatedTotalMinor - depositPaidMinor, 0);

  return {
    bookingReference: input.bookingReference,
    customerName: input.draft.customer.fullName,
    customerEmail: input.draft.customer.email,
    customerPhone: input.draft.customer.phone,
    requestedDate: formatDateLabel(input.draft.selectedDate),
    requestedTime: input.draft.selectedSlotStart,
    serviceLabel: input.draft.packageId ? getServicePackage(input.draft.packageId).label : "Selected service",
    vehicleLabel,
    addressSummary: input.draft.postcode,
    estimatedTotal: formatMoneyGBP(input.estimatedTotalMinor),
    depositPaid: depositPaidMinor > 0 ? formatMoneyGBP(depositPaidMinor) : "No deposit paid",
    remainingBalance: formatMoneyGBP(balanceDueMinor),
    statusLabel: input.statusLabel ?? "Waiting for review",
    zoneStatusLabel: getZoneStatusLabel(input.zoneStatus),
    isOutsideZoneRequest: input.zoneStatus !== "standard_zone",
  };
}
