import type { BookingStatus } from "../booking/types";
import { arePaymentsEnabled } from "../config/features";
import { listBookingRecords } from "../db/booking-repository";
import { isDatabaseConfigured } from "../db/postgres";
import { getAdminBookingStatusLabel } from "../booking/status-labels";
import { getServicePackage } from "../pricing";

export type AdminRequestFilter =
  | "needs_review"
  | "outside_zone"
  | "payment_hold"
  | "reschedule"
  | "approved"
  | "declined"
  | "all";

export type AdminRequestListItem = {
  id: string;
  reference: string;
  status: BookingStatus;
  requestedDateLabel: string;
  requestedTimeLabel: string;
  serviceLabel: string;
  customerName: string;
  vehicleLabel: string;
  postcode: string;
  locationLabel: string;
  zoneLabel: string;
  isOutsideZone: boolean;
  depositLabel: string;
  createdAtLabel: string;
  href: string;
  warning?: string;
};

export type AdminRequestsInboxData = {
  counts: Record<AdminRequestFilter, number>;
  groups: {
    label: string;
    items: AdminRequestListItem[];
  }[];
};

export const adminRequestsInboxUsesMockData = false;

const baseAdminRequestFilters = [
  "needs_review",
  "outside_zone",
  "reschedule",
  "approved",
  "declined",
  "all",
] as const satisfies readonly AdminRequestFilter[];

export const adminRequestFilters = (
  arePaymentsEnabled()
    ? [
        "needs_review",
        "outside_zone",
        "payment_hold",
        "reschedule",
        "approved",
        "declined",
        "all",
      ]
    : baseAdminRequestFilters
) as readonly AdminRequestFilter[];

export const adminRequestFilterLabels: Record<AdminRequestFilter, string> = {
  needs_review: "Needs review",
  outside_zone: "Outside-zone",
  payment_hold: "Payment hold",
  reschedule: "Reschedule",
  approved: "Approved",
  declined: "Declined",
  all: "All",
};

const mockRequests: AdminRequestListItem[] = [
  {
    id: "mock-request-1",
    reference: "AV-2026-DEMO1",
    status: "pending_admin_review",
    requestedDateLabel: "Today",
    requestedTimeLabel: "11:45",
    serviceLabel: "Deep Clean",
    customerName: "Example customer",
    vehicleLabel: "BMW 3 Series",
    postcode: "CR0 1AA",
    locationLabel: "Croydon",
    zoneLabel: "Standard service zone",
    isOutsideZone: false,
    depositLabel: "Awaiting review",
    createdAtLabel: "Submitted 18 mins ago",
    href: "/admin/requests/mock-request-1",
  },
  {
    id: "mock-request-2",
    reference: "AV-2026-DEMO2",
    status: "pending_admin_review",
    requestedDateLabel: "Today",
    requestedTimeLabel: "14:15",
    serviceLabel: "Maintenance",
    customerName: "Example customer",
    vehicleLabel: "Range Rover",
    postcode: "BR3 3AA",
    locationLabel: "Outside-zone review",
    zoneLabel: "Outside-zone request",
    isOutsideZone: true,
    depositLabel: "Awaiting review",
    createdAtLabel: "Submitted 42 mins ago",
    href: "/admin/requests/mock-request-2",
    warning: "Outside-zone request - check vehicle count and location.",
  },
  {
    id: "mock-request-3",
    reference: "AV-2026-DEMO3",
    status: "payment_hold",
    requestedDateLabel: "Tomorrow",
    requestedTimeLabel: "09:00",
    serviceLabel: "Maintenance",
    customerName: "Example customer",
    vehicleLabel: "Audi A3",
    postcode: "CR2 6AA",
    locationLabel: "South Croydon",
    zoneLabel: "Standard service zone",
    isOutsideZone: false,
    depositLabel: "Payment in progress",
    createdAtLabel: "Hold started 7 mins ago",
    href: "/admin/requests/mock-request-3",
    warning: "Payment hold blocks the slot until it expires or payment completes.",
  },
  {
    id: "mock-request-4",
    reference: "AV-2026-DEMO4",
    status: "reschedule_requested",
    requestedDateLabel: "This week",
    requestedTimeLabel: "15:00",
    serviceLabel: "Deep Clean",
    customerName: "Example customer",
    vehicleLabel: "Mercedes GLC",
    postcode: "CR0 5AA",
    locationLabel: "Croydon",
    zoneLabel: "Standard service zone",
    isOutsideZone: false,
    depositLabel: "Reschedule review",
    createdAtLabel: "Updated yesterday",
    href: "/admin/requests/mock-request-4",
    warning: "New time suggested.",
  },
  {
    id: "mock-request-5",
    reference: "AV-2026-DEMO5",
    status: "approved",
    requestedDateLabel: "This week",
    requestedTimeLabel: "10:30",
    serviceLabel: "Maintenance",
    customerName: "Example customer",
    vehicleLabel: "Volkswagen Golf",
    postcode: "CR0 2AA",
    locationLabel: "Croydon",
    zoneLabel: "Standard service zone",
    isOutsideZone: false,
    depositLabel: "Approved",
    createdAtLabel: "Approved 2 days ago",
    href: "/admin/requests/mock-request-5",
  },
  {
    id: "mock-request-6",
    reference: "AV-2026-DEMO6",
    status: "declined",
    requestedDateLabel: "Older",
    requestedTimeLabel: "13:00",
    serviceLabel: "Deep Clean",
    customerName: "Example customer",
    vehicleLabel: "Ford Kuga",
    postcode: "SE25 4AA",
    locationLabel: "Outside-zone review",
    zoneLabel: "Outside-zone request",
    isOutsideZone: true,
    depositLabel: "Declined",
    createdAtLabel: "Declined last week",
    href: "/admin/requests/mock-request-6",
  },
];

export function parseAdminRequestFilter(value: string | null | undefined): AdminRequestFilter {
  return adminRequestFilters.includes(value as AdminRequestFilter)
    ? (value as AdminRequestFilter)
    : "needs_review";
}

function matchesFilter(item: AdminRequestListItem, filter: AdminRequestFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "needs_review") {
    return item.status === "pending_admin_review";
  }

  if (filter === "outside_zone") {
    return item.isOutsideZone;
  }

  if (filter === "payment_hold") {
    return item.status === "payment_hold";
  }

  if (filter === "reschedule") {
    return item.status === "reschedule_requested";
  }

  return item.status === filter;
}

function matchesSearch(item: AdminRequestListItem, search: string | undefined) {
  const normalizedSearch = search?.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [
    item.customerName,
    item.reference,
    item.postcode,
    item.vehicleLabel,
    item.serviceLabel,
    item.locationLabel,
  ].some((value) => value.toLowerCase().includes(normalizedSearch));
}

function getCounts(items: AdminRequestListItem[]): Record<AdminRequestFilter, number> {
  return {
    needs_review: items.filter((item) => matchesFilter(item, "needs_review")).length,
    outside_zone: items.filter((item) => matchesFilter(item, "outside_zone")).length,
    payment_hold: items.filter((item) => matchesFilter(item, "payment_hold")).length,
    reschedule: items.filter((item) => matchesFilter(item, "reschedule")).length,
    approved: items.filter((item) => matchesFilter(item, "approved")).length,
    declined: items.filter((item) => matchesFilter(item, "declined")).length,
    all: items.length,
  };
}

function getVisibleMockRequests() {
  return arePaymentsEnabled()
    ? mockRequests
    : mockRequests.filter((request) => request.status !== "payment_hold");
}

function groupRequests(items: AdminRequestListItem[]) {
  const groupOrder = ["Today", "Tomorrow", "This week", "Older"];

  return groupOrder
    .map((label) => ({
      label,
      items: items.filter((item) => item.requestedDateLabel === label),
    }))
    .filter((group) => group.items.length > 0);
}

function getDateBucket(isoDate: string) {
  const requestedDate = new Date(isoDate);

  if (Number.isNaN(requestedDate.getTime())) {
    return "Older";
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const requestedStart = new Date(
    requestedDate.getFullYear(),
    requestedDate.getMonth(),
    requestedDate.getDate(),
  );
  const days = Math.round((requestedStart.getTime() - todayStart.getTime()) / 86_400_000);

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1 && days <= 7) return "This week";

  return "Older";
}

function formatRequestedTime(isoDate: string) {
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

function formatSubmittedLabel(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Submitted";
  }

  return `Submitted ${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date)}`;
}

function getZoneLabel(zoneStatus: string) {
  if (zoneStatus === "outside_zone_volume_exception") return "Outside-zone request";
  if (zoneStatus === "outside_service_area") return "Outside service area";

  return "Standard service zone";
}

function getWorkflowLabel(status: BookingStatus) {
  if (status === "pending_admin_review") return "Awaiting review";
  if (status === "reschedule_requested") return "Reschedule review";
  if (status === "approved") return "Approved";
  if (status === "declined") return "Declined";
  if (status === "payment_hold") return "Payment in progress";

  return getAdminBookingStatusLabel(status);
}

async function getDatabaseRequestItems() {
  const records = await listBookingRecords();

  return records.map((record): AdminRequestListItem => {
    const isOutsideZone = record.zoneStatus !== "standard_zone";
    const vehicleName = [record.vehicleMake, record.vehicleModel].filter(Boolean).join(" ");
    const vehicleLabel = vehicleName || `${record.vehicleCount} vehicle${record.vehicleCount === 1 ? "" : "s"}`;

    return {
      id: record.id,
      reference: record.reference,
      status: record.status,
      requestedDateLabel: getDateBucket(record.requestedStartAt),
      requestedTimeLabel: formatRequestedTime(record.requestedStartAt),
      serviceLabel: getServicePackage(record.packageId).label,
      customerName: record.customerName,
      vehicleLabel,
      postcode: record.postcode,
      locationLabel: record.fullAddress || record.postcode,
      zoneLabel: getZoneLabel(record.zoneStatus),
      isOutsideZone,
      depositLabel: getWorkflowLabel(record.status),
      createdAtLabel: formatSubmittedLabel(record.createdAt),
      href: `/admin/requests/${encodeURIComponent(record.id)}`,
      warning: isOutsideZone ? "Outside-zone request - check vehicle count and location." : undefined,
    };
  });
}

export async function getAdminRequestsInboxData(input: {
  filter: AdminRequestFilter;
  search?: string;
}): Promise<AdminRequestsInboxData> {
  const items = isDatabaseConfigured() ? await getDatabaseRequestItems() : [];
  const filteredItems = items.filter(
    (item) => matchesFilter(item, input.filter) && matchesSearch(item, input.search),
  );

  return {
    counts: getCounts(items),
    groups: groupRequests(filteredItems),
  };
}
