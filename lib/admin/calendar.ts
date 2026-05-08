import { getAdminBookingStatusLabel } from "../booking/status-labels";
import type { BookingStatus } from "../booking/types";
import { arePaymentsEnabled } from "../config/features";
import { getWorkingHoursForDate, parseTimeToMinutes, formatMinutesToTime } from "../availability/working-hours";
import type { DayAvailability } from "../availability/types";

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

export const adminCalendarUsesMockData = true;
const businessTimeZone = "Europe/London";
const minimumDisplayedGapMinutes = 15;
const paymentsEnabled = arePaymentsEnabled();

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

export function buildAdminCalendarWeek(selectedDate: string): AdminCalendarWeekDay[] {
  const selected = createUtcNoonDate(selectedDate);
  const weekday = selected.getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;
  const monday = addDays(selectedDate, -daysSinceMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    const availability = getWorkingHoursForDate({ date });
    const summary = getMockWeekSummary(date, availability);

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
  const availability = getWorkingHoursForDate({ date });
  const bookings = getMockCalendarBookings(date, availability).filter(
    (booking) => paymentsEnabled || booking.status !== "payment_hold",
  );
  const blockedTimes = getMockBlockedTimes(date, availability);

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
      approvedCount: bookings.filter((booking) => isApprovedJobStatus(booking.status)).length,
      pendingCount: bookings.filter((booking) => booking.status === "pending_admin_review").length,
      holdCount: paymentsEnabled ? bookings.filter((booking) => booking.status === "payment_hold").length : 0,
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

function getMockWeekSummary(date: string, availability: DayAvailability) {
  if (availability.isClosed) {
    return {
      approvedCount: 0,
      pendingCount: 0,
      holdCount: 0,
    };
  }

  const weekday = createUtcNoonDate(date).getUTCDay();

  return {
    approvedCount: weekday === 6 ? 1 : 2,
    pendingCount: weekday === 1 || weekday === 3 ? 1 : 0,
    holdCount: paymentsEnabled && weekday === 4 ? 1 : 0,
  };
}

function getMockCalendarBookings(date: string, availability: DayAvailability): CalendarBooking[] {
  // TODO: Replace safe mock bookings with database-backed calendar queries.
  if (availability.isClosed) {
    return [];
  }

  const weekday = createUtcNoonDate(date).getUTCDay();

  if (weekday === 6) {
    return [
      {
        id: "mock-calendar-sat-job",
        reference: "AV-2026-CAL1",
        status: "approved",
        startTime: "09:00",
        serviceEndTime: "10:15",
        blockedUntilTime: "11:00",
        serviceLabel: "Maintenance",
        customerName: "Example customer",
        vehicleLabel: "Volkswagen Golf",
        href: "/admin/bookings/mock-request-5",
      },
    ];
  }

  return [
    {
      id: "mock-calendar-job-1",
      reference: "AV-2026-CAL1",
      status: "approved",
      startTime: "09:00",
      serviceEndTime: "10:00",
      blockedUntilTime: "10:45",
      serviceLabel: "Maintenance",
      customerName: "Example customer",
      vehicleLabel: "Audi A3",
      href: "/admin/bookings/mock-request-5",
    },
    {
      id: "mock-calendar-request-1",
      reference: "AV-2026-CAL2",
      status: "pending_admin_review",
      startTime: "11:45",
      serviceEndTime: "13:45",
      blockedUntilTime: "14:30",
      serviceLabel: "Deep Clean",
      customerName: "Example customer",
      vehicleLabel: "BMW 3 Series",
      href: "/admin/requests/mock-request-1",
    },
    {
      id: "mock-calendar-hold-1",
      reference: "AV-2026-CAL3",
      status: "payment_hold",
      startTime: "15:15",
      serviceEndTime: "16:00",
      blockedUntilTime: "16:45",
      serviceLabel: "Maintenance",
      customerName: "Example customer",
      vehicleLabel: "Ford Puma",
      href: "/admin/requests/mock-request-3",
    },
  ];
}

function getMockBlockedTimes(date: string, availability: DayAvailability): BlockedTime[] {
  // TODO: Replace safe mock blocked time with admin-managed availability overrides.
  if (availability.isClosed) {
    return [];
  }

  const weekday = createUtcNoonDate(date).getUTCDay();

  if (weekday === 6) {
    return [
      {
        id: "mock-saturday-block",
        startTime: "12:00",
        endTime: "13:00",
        reason: "Van restock.",
      },
    ];
  }

  return [
    {
      id: "mock-weekday-block",
      startTime: "10:45",
      endTime: "11:15",
      reason: "Van prep and admin catch-up.",
    },
  ];
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
