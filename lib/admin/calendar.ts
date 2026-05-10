import { getAdminBookingStatusLabel } from "../booking/status-labels";
import type { BookingStatus } from "../booking/types";
import { arePaymentsEnabled } from "../config/features";
import { isDatabaseConfigured } from "../db/postgres";
import { listBookingRecords, type BookingListRecord } from "../db/booking-repository";
import { getServicePackage } from "../pricing/catalog";
import { getWorkingHoursForDate, parseTimeToMinutes, formatMinutesToTime } from "../availability/working-hours";
import type { DayAvailability } from "../availability/types";
import { getAvailabilityPersistence } from "./availability";

export type AdminTimelineItemType = "booking" | "buffer" | "blocked_time" | "available" | "closed";

export type AdminTimelineItem = {
  id: string;
  type: AdminTimelineItemType;
  startLabel: string;
  endLabel?: string;
  status?: BookingStatus;
  statusLabel?: string;
  title: string;
  subtitle?: string;
  href?: string;
  variant?: "approved" | "pending" | "hold" | "buffer" | "blocked" | "available" | "closed";
};

export type AdminCalendarDay = {
  date: string;
  dateLabel: string;
  isClosed: boolean;
  summary: {
    approvedCount: number;
    pendingCount: number;
    holdCount: number;
  };
  items: AdminTimelineItem[];
};

export type AdminCalendarWeekDay = {
  date: string;
  weekdayLabel: string;
  dayNumber: string;
  isSelected: boolean;
  hasPending: boolean;
  jobCount: number;
};

export type CalendarBooking = {
  id: string;
  reference: string;
  status: BookingStatus;
  startTime: string;
  serviceEndTime: string;
  blockedUntilTime: string;
  serviceLabel: string;
  customerName: string;
  vehicleLabel: string;
  href: string;
};

export type BlockedTime = {
  id: string;
  startTime: string;
  endTime: string;
  reason: string;
};

type BusyWindow = {
  start: number;
  end: number;
};

export const adminCalendarUsesMockData = false;
const businessTimeZone = "Europe/London";
const minimumDisplayedGapMinutes = 15;
const paymentsEnabled = arePaymentsEnabled();
const adminCalendarRangeDays = 28;

export function getTodayInBusinessTimezone() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: businessTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export function parseAdminCalendarDate(value: string | null | undefined) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return getTodayInBusinessTimezone();
}

export async function buildAdminCalendarWeek(selectedDate: string): Promise<AdminCalendarWeekDay[]> {
  const selected = createUtcNoonDate(selectedDate);
  const weekday = selected.getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;
  const monday = addDays(selectedDate, -daysSinceMonday);
  const records = isDatabaseConfigured() ? await listBookingRecords() : [];

  return Array.from({ length: adminCalendarRangeDays }, (_, index) => {
    const date = addDays(monday, index);
    const summary = getCalendarSummary(records.filter((record) => getBusinessDate(record.requestedStartAt) === date));

    return {
      date,
      weekdayLabel: formatDatePart(date, { weekday: "short" }),
      dayNumber: formatDatePart(date, { day: "2-digit" }),
      isSelected: date === selectedDate,
      hasPending: summary.pendingCount > 0 || (paymentsEnabled && summary.holdCount > 0),
      jobCount: summary.approvedCount,
    };
  });
}

export async function getAdminCalendarDay(input: { date: string }): Promise<AdminCalendarDay> {
  const date = parseAdminCalendarDate(input.date);
  const availabilityPersistence = await getAvailabilityPersistence();
  const availability = getWorkingHoursForDate({
    date,
    rules: availabilityPersistence.rules,
    overrides: availabilityPersistence.overrides,
  });
  const records = isDatabaseConfigured()
    ? (await listBookingRecords()).filter((record) => getBusinessDate(record.requestedStartAt) === date)
    : [];
  const bookings = records
    .filter((record) => paymentsEnabled || record.status !== "payment_hold")
    .map(toCalendarBooking);
  const blockedTimes: BlockedTime[] = availability.blockedWindows.map((window, index) => ({
    id: `${date}-blocked-${index}`,
    startTime: window.startTime,
    endTime: window.endTime,
    reason: window.reason ?? "Blocked time",
  }));
  const summary = getCalendarSummary(records);

  return {
    date,
    dateLabel: formatDatePart(date, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    isClosed: availability.isClosed,
    summary: {
      approvedCount: summary.approvedCount,
      pendingCount: summary.pendingCount,
      holdCount: paymentsEnabled ? summary.holdCount : 0,
    },
    items: buildTimelineItems({
      date,
      bookings,
      blockedTimes,
      availability,
    }),
  };
}

export function buildTimelineItems(input: {
  date: string;
  bookings: CalendarBooking[];
  blockedTimes: BlockedTime[];
  availability: DayAvailability;
}): AdminTimelineItem[] {
  if (input.availability.isClosed) {
    return [
      {
        id: `${input.date}-closed`,
        type: "closed",
        startLabel: "Closed",
        title: "Day closed",
        subtitle: "No working hours are available for this date.",
        variant: "closed",
      },
    ];
  }

  const bookingItems = input.bookings.flatMap((booking) => {
    const items: AdminTimelineItem[] = [
      {
        id: `booking-${booking.id}`,
        type: "booking",
        startLabel: booking.startTime,
        endLabel: booking.serviceEndTime,
        status: booking.status,
        statusLabel: getAdminBookingStatusLabel(booking.status),
        title: booking.serviceLabel,
        subtitle: `${booking.customerName} - ${booking.vehicleLabel}`,
        href: booking.href,
        variant: getTimelineBookingVariant(booking.status),
      },
    ];

    if (parseTimeToMinutes(booking.blockedUntilTime) > parseTimeToMinutes(booking.serviceEndTime)) {
      items.push({
        id: `buffer-${booking.id}`,
        type: "buffer",
        startLabel: booking.serviceEndTime,
        endLabel: booking.blockedUntilTime,
        title: "Travel buffer",
        subtitle: `Internal buffer after ${booking.serviceLabel}.`,
        variant: "buffer",
      });
    }

    return items;
  });

  const blockedItems: AdminTimelineItem[] = input.blockedTimes.map((blockedTime) => ({
    id: `blocked-${blockedTime.id}`,
    type: "blocked_time",
    startLabel: blockedTime.startTime,
    endLabel: blockedTime.endTime,
    title: "Blocked time",
    subtitle: blockedTime.reason,
    variant: "blocked",
  }));

  const availableItems = buildAvailableGapItems(input.date, input.availability, input.bookings, input.blockedTimes);

  return [...bookingItems, ...blockedItems, ...availableItems].sort(sortTimelineItems);
}

function buildAvailableGapItems(
  date: string,
  availability: DayAvailability,
  bookings: CalendarBooking[],
  blockedTimes: BlockedTime[],
): AdminTimelineItem[] {
  const gaps: AdminTimelineItem[] = [];
  const busyWindows = mergeBusyWindows([
    ...bookings.map((booking) => ({
      start: parseTimeToMinutes(booking.startTime),
      end: parseTimeToMinutes(booking.blockedUntilTime),
    })),
    ...blockedTimes.map((blockedTime) => ({
      start: parseTimeToMinutes(blockedTime.startTime),
      end: parseTimeToMinutes(blockedTime.endTime),
    })),
  ]);

  for (const workingWindow of availability.workingWindows) {
    const windowStart = parseTimeToMinutes(workingWindow.startTime);
    const windowEnd = parseTimeToMinutes(workingWindow.endTime);
    let cursor = windowStart;

    for (const busyWindow of busyWindows) {
      if (busyWindow.end <= windowStart || busyWindow.start >= windowEnd) {
        continue;
      }

      const busyStart = Math.max(busyWindow.start, windowStart);
      const busyEnd = Math.min(busyWindow.end, windowEnd);

      if (busyStart - cursor >= minimumDisplayedGapMinutes) {
        gaps.push(createAvailableItem(date, cursor, busyStart));
      }

      cursor = Math.max(cursor, busyEnd);
    }

    if (windowEnd - cursor >= minimumDisplayedGapMinutes) {
      gaps.push(createAvailableItem(date, cursor, windowEnd));
    }
  }

  return gaps;
}

function createAvailableItem(date: string, start: number, end: number): AdminTimelineItem {
  return {
    id: `available-${date}-${start}-${end}`,
    type: "available",
    startLabel: formatMinutesToTime(start),
    endLabel: formatMinutesToTime(end),
    title: "Available gap",
    subtitle: "Open space in the day. Check duration before adding a booking.",
    href: `/admin/bookings/new?date=${date}&start=${formatMinutesToTime(start)}`,
    variant: "available",
  };
}

function mergeBusyWindows(windows: BusyWindow[]) {
  const sorted = windows
    .filter((window) => window.end > window.start)
    .sort((a, b) => a.start - b.start);
  const merged: BusyWindow[] = [];

  for (const window of sorted) {
    const lastWindow = merged.at(-1);

    if (!lastWindow || window.start > lastWindow.end) {
      merged.push({ ...window });
      continue;
    }

    lastWindow.end = Math.max(lastWindow.end, window.end);
  }

  return merged;
}

function sortTimelineItems(a: AdminTimelineItem, b: AdminTimelineItem) {
  const timeDifference = getTimelineSortMinutes(a) - getTimelineSortMinutes(b);

  if (timeDifference !== 0) {
    return timeDifference;
  }

  return getTimelineTypeSortOrder(a.type) - getTimelineTypeSortOrder(b.type);
}

function getTimelineSortMinutes(item: AdminTimelineItem) {
  if (/^\d{2}:\d{2}$/.test(item.startLabel)) {
    return parseTimeToMinutes(item.startLabel);
  }

  return 0;
}

function getTimelineTypeSortOrder(type: AdminTimelineItemType) {
  const order: Record<AdminTimelineItemType, number> = {
    booking: 1,
    blocked_time: 2,
    buffer: 3,
    available: 4,
    closed: 5,
  };

  return order[type];
}

function getTimelineBookingVariant(status: BookingStatus): AdminTimelineItem["variant"] {
  if (status === "payment_hold") {
    return "hold";
  }

  if (status === "pending_admin_review" || status === "reschedule_requested") {
    return "pending";
  }

  return "approved";
}

function isApprovedJobStatus(status: BookingStatus) {
  return status === "approved" || status === "on_the_way" || status === "arrived" || status === "in_progress";
}

function getCalendarSummary(records: BookingListRecord[]) {
  return {
    approvedCount: records.filter((record) => isApprovedJobStatus(record.status)).length,
    pendingCount: records.filter((record) => record.status === "pending_admin_review").length,
    holdCount: records.filter((record) => record.status === "payment_hold").length,
  };
}

function toCalendarBooking(record: BookingListRecord): CalendarBooking {
  const vehicleLabel = [record.vehicleMake, record.vehicleModel].filter(Boolean).join(" ")
    || `${record.vehicleCount} vehicle${record.vehicleCount === 1 ? "" : "s"}`;
  const href = record.status === "pending_admin_review" || record.status === "payment_hold"
    ? `/admin/requests/${encodeURIComponent(record.id)}`
    : `/admin/bookings/${encodeURIComponent(record.id)}`;

  return {
    id: record.id,
    reference: record.reference,
    status: record.status,
    startTime: formatBusinessTime(record.requestedStartAt),
    serviceEndTime: formatBusinessTime(record.serviceEndsAt),
    blockedUntilTime: formatBusinessTime(record.blockedUntil),
    serviceLabel: getServicePackage(record.packageId).label,
    customerName: record.customerName,
    vehicleLabel,
    href,
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

function formatDatePart(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: businessTimeZone,
    ...options,
  }).format(createUtcNoonDate(date));
}

function createUtcNoonDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));

  return result.toISOString().slice(0, 10);
}
