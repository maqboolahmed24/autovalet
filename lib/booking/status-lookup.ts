import { getCustomerBookingStatusLabel } from "./status-labels";
import type { BookingStatus, PackageId } from "./types";
import { isDatabaseConfigured, query } from "../db/postgres";
import { getServicePackage } from "../pricing/catalog";

export type PublicBookingStatus = {
  reference: string;
  status: BookingStatus;
  statusLabel: string;
  serviceLabel: string;
  requestedStartLabel: string;
};

type BookingStatusRow = {
  reference: string;
  status: string;
  package_id: string;
  requested_start_at: Date | string;
};

function toBookingStatus(value: string): BookingStatus {
  return value as BookingStatus;
}

function toPackageId(value: string): PackageId {
  return value === "deep_clean" ? "deep_clean" : "maintenance";
}

function formatBusinessDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

export async function getPublicBookingStatus(reference: string): Promise<PublicBookingStatus | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const result = await query<BookingStatusRow>(
    `
      SELECT reference, status, package_id, requested_start_at
      FROM bookings
      WHERE reference = $1
      LIMIT 1
    `,
    [reference.trim()],
  );
  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const status = toBookingStatus(row.status);

  return {
    reference: row.reference,
    status,
    statusLabel: getCustomerBookingStatusLabel(status),
    serviceLabel: getServicePackage(toPackageId(row.package_id)).label,
    requestedStartLabel: formatBusinessDateTime(row.requested_start_at),
  };
}
