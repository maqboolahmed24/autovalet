import type { BookingStatus } from "../booking/types";

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

const mockNeedsReview: AdminDashboardBooking[] = [
  {
    id: "mock-request-1",
    reference: "AV-2026-DEMO1",
    status: "pending_admin_review",
    requestedStartLabel: "11:45",
    serviceLabel: "Deep Clean",
    customerName: "Example customer",
    vehicleLabel: "BMW 3 Series",
    locationLabel: "Croydon",
    depositLabel: "Deposit paid",
    zoneLabel: "Standard service zone",
    href: "/admin/requests",
  },
  {
    id: "mock-request-2",
    reference: "AV-2026-DEMO2",
    status: "pending_admin_review",
    requestedStartLabel: "14:15",
    serviceLabel: "Maintenance",
    customerName: "Example customer",
    vehicleLabel: "Range Rover",
    locationLabel: "Outside-zone review",
    depositLabel: "Deposit paid",
    zoneLabel: "3+ vehicle review",
    href: "/admin/requests",
  },
];

const mockTodayJobs: AdminDashboardBooking[] = [
  {
    id: "mock-job-1",
    reference: "AV-2026-DEMO3",
    status: "approved",
    requestedStartLabel: "09:00",
    serviceLabel: "Maintenance",
    customerName: "Example customer",
    vehicleLabel: "Audi A3",
    locationLabel: "Croydon",
    depositLabel: "Deposit paid",
    href: "/admin/calendar",
  },
  {
    id: "mock-job-2",
    reference: "AV-2026-DEMO4",
    status: "on_the_way",
    requestedStartLabel: "15:00",
    serviceLabel: "Deep Clean",
    customerName: "Example customer",
    vehicleLabel: "Mercedes GLC",
    locationLabel: "Croydon",
    depositLabel: "Deposit paid",
    href: "/admin/calendar",
  },
];

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  // TODO: Replace this safe mock source with database-backed dashboard queries.
  // The mock names and references are deliberately generic and must not be treated as live reporting.
  return {
    isMockData: true,
    summary: {
      pendingCount: mockNeedsReview.length,
      todayJobsCount: mockTodayJobs.length,
      depositsThisWeekMinor: 12000,
      estimatedRevenueThisWeekMinor: 46500,
    },
    alerts: [
      {
        id: "mock-alert-data-source",
        title: "Dashboard data is placeholder",
        message: "Connect database persistence before treating counts, deposits or estimates as live.",
        variant: "info",
      },
      {
        id: "mock-alert-outside-zone",
        title: "Outside-zone request",
        message: "Review vehicle count and location before approval.",
        variant: "warning",
        href: "/admin/requests",
      },
      {
        id: "mock-alert-payment-hold",
        title: "Payment hold attention",
        message: "Payment holds should expire or move to review through verified webhooks.",
        variant: "warning",
      },
    ],
    nextJob: mockTodayJobs[0],
    needsReview: mockNeedsReview,
    todayJobs: mockTodayJobs,
  };
}
