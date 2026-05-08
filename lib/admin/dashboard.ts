import type { BookingStatus } from "../booking/types";
import { isDatabaseConfigured } from "../db/postgres";
import { listBookingRecords, type BookingListRecord } from "../db/booking-repository";
import { getServicePackage } from "../pricing/catalog";

export type AdminDashboardBooking = {
  id: string;
  reference: string;
  status: BookingStatus;
  requestedStartLabel: string;
  serviceLabel: string;
  customerName: string;
  vehicleLabel: string;
  locationLabel: string;
  depositLabel: string;
  zoneLabel?: string;
  href: string;
};

export type AdminDashboardAlert = {
  id: string;
  title: string;
  message: string;
  variant: "warning" | "info" | "danger";
  href?: string;
};

export type AdminDashboardData = {
  isMockData: boolean;
  summary: {
    pendingCount: number;
    todayJobsCount: number;
    depositsThisWeekMinor: number;
    estimatedRevenueThisWeekMinor: number;
  };
  alerts: AdminDashboardAlert[];
  nextJob?: AdminDashboardBooking;
  needsReview: AdminDashboardBooking[];
  todayJobs: AdminDashboardBooking[];
};

const businessTimeZone = "Europe/London";

function emptyDashboardData(): AdminDashboardData {
  return {
    isMockData: false,
    summary: {
      pendingCount: 0,
      todayJobsCount: 0,
      depositsThisWeekMinor: 0,
      estimatedRevenueThisWeekMinor: 0,
    },
    alerts: [],
    needsReview: [],
    todayJobs: [],
  };
}

function getBusinessDate(value: Date | string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: businessTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function formatBusinessTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: businessTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));

  return result.toISOString().slice(0, 10);
}

function getWeekBounds(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const selected = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  const daysSinceMonday = (selected.getUTCDay() + 6) % 7;
  const weekStart = addDays(date, -daysSinceMonday);

  return {
    weekStart,
    weekEndExclusive: addDays(weekStart, 7),
  };
}

function isTodayJobStatus(status: BookingStatus) {
  return status === "approved" || status === "on_the_way" || status === "arrived" || status === "in_progress";
}

function isRevenueStatus(status: BookingStatus) {
  return ![
    "declined",
    "cancelled_by_admin",
    "cancelled_by_customer",
    "expired",
    "payment_failed",
    "refunded",
  ].includes(status);
}

function getVehicleLabel(record: BookingListRecord) {
  return [record.vehicleMake, record.vehicleModel].filter(Boolean).join(" ")
    || `${record.vehicleCount} vehicle${record.vehicleCount === 1 ? "" : "s"}`;
}

function toDashboardBooking(record: BookingListRecord): AdminDashboardBooking {
  return {
    id: record.id,
    reference: record.reference,
    status: record.status,
    requestedStartLabel: formatBusinessTime(record.requestedStartAt),
    serviceLabel: getServicePackage(record.packageId).label,
    customerName: record.customerName,
    vehicleLabel: getVehicleLabel(record),
    locationLabel: record.postcode || record.fullAddress,
    depositLabel: record.status === "pending_admin_review" ? "Awaiting review" : "Approved",
    zoneLabel: record.zoneStatus === "standard_zone" ? "Standard service zone" : "Outside-zone review",
    href: record.status === "pending_admin_review"
      ? `/admin/requests/${encodeURIComponent(record.id)}`
      : `/admin/bookings/${encodeURIComponent(record.id)}`,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!isDatabaseConfigured()) {
    return emptyDashboardData();
  }

  const records = await listBookingRecords();
  const today = getBusinessDate(new Date());
  const { weekStart, weekEndExclusive } = getWeekBounds(today);
  const needsReview = records
    .filter((record) => record.status === "pending_admin_review")
    .sort((a, b) => new Date(a.requestedStartAt).getTime() - new Date(b.requestedStartAt).getTime())
    .map(toDashboardBooking);
  const todayJobs = records
    .filter((record) => isTodayJobStatus(record.status) && getBusinessDate(record.requestedStartAt) === today)
    .sort((a, b) => new Date(a.requestedStartAt).getTime() - new Date(b.requestedStartAt).getTime())
    .map(toDashboardBooking);
  const estimatedRevenueThisWeekMinor = records
    .filter((record) => {
      const date = getBusinessDate(record.requestedStartAt);

      return date >= weekStart && date < weekEndExclusive && isRevenueStatus(record.status);
    })
    .reduce((total, record) => total + record.estimatedTotalMinor, 0);
  const alerts = needsReview.length > 0
    ? [
        {
          id: "pending-review",
          title: "Booking requests need review",
          message: `${needsReview.length} request${needsReview.length === 1 ? "" : "s"} waiting for admin approval.`,
          variant: "warning" as const,
          href: "/admin/requests",
        },
      ]
    : [];

  return {
    isMockData: false,
    summary: {
      pendingCount: needsReview.length,
      todayJobsCount: todayJobs.length,
      depositsThisWeekMinor: 0,
      estimatedRevenueThisWeekMinor,
    },
    alerts,
    nextJob: todayJobs[0],
    needsReview,
    todayJobs,
  };
}
