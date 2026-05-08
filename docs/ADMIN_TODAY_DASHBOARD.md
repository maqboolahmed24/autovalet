# Admin Today Dashboard

The Today dashboard is the default AUTO VALET admin landing screen. It keeps the admin focused on what needs attention now, not long-range analytics.

## Purpose

The dashboard answers:

1. How many paid booking requests need review?
2. How many approved jobs are scheduled today?
3. What is the next job?
4. What deposits and estimated revenue are visible for the week?
5. Are there alerts such as outside-zone requests or payment holds?
6. What quick action should the admin take next?

## Data Model

Dashboard data lives behind `lib/admin/dashboard.ts`.

Main shape:

```ts
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
```

The current implementation uses safe mock data with generic customer labels because database persistence is not connected yet. The UI clearly notes when dashboard data is placeholder.

## Summary Cards

Summary cards show:

- Pending: number of `pending_admin_review` bookings.
- Today: count of approved or active jobs today.
- Deposits: deposit total this week.
- Estimate: estimated revenue this week.

Money values use integer minor units and are displayed with `formatMoneyGBP`.

## Booking Card Fields

Dashboard booking cards show:

- Requested time.
- Human admin status label.
- Service label.
- Customer label.
- Vehicle label.
- Location summary.
- Deposit label.
- Optional zone label.
- Primary action link.

Cards must never show raw booking statuses.

## Alerts

Alerts are short operational notices with variants:

- `info`
- `warning`
- `danger`

Examples:

- Placeholder data warning.
- Outside-zone request.
- Payment hold attention.

## Empty States

Pending requests empty state:

- Title: `No requests waiting.`
- Description: `New paid booking requests will appear here.`

Today jobs empty state:

- Title: `No jobs today.`
- Description: `Your day is clear. You can still add blocked time or check upcoming requests.`

## API Contract

```http
GET /api/admin/dashboard
```

The route requires `view_dashboard` through `requireAdmin`.

Current auth placeholder response:

```json
{
  "success": false,
  "error": {
    "code": "ADMIN_AUTH_NOT_CONFIGURED",
    "message": "Admin authentication is not configured yet.",
    "details": {}
  }
}
```

After auth is connected, the route may return placeholder dashboard data until database persistence is connected:

```json
{
  "success": true,
  "data": {
    "isMockData": true,
    "summary": {
      "pendingCount": 2,
      "todayJobsCount": 2,
      "depositsThisWeekMinor": 12000,
      "estimatedRevenueThisWeekMinor": 46500
    },
    "alerts": [],
    "needsReview": [],
    "todayJobs": []
  },
  "message": "Dashboard data is placeholder until database persistence is connected."
}
```

## Future Database Integration

Replace mock data with database queries that:

1. Count `pending_admin_review` bookings.
2. Count today jobs in `approved`, `on_the_way`, `arrived`, and `in_progress`.
3. Sum deposit payments for the current week.
4. Sum estimated totals for the current week.
5. Load next job by requested start time.
6. Load a short needs-review list.
7. Load a short today timeline preview.
8. Flag outside-zone and payment-hold alerts.

Queries should avoid exposing unnecessary PII and should respect future role permissions.

## Mobile-First Rules

Mobile order:

1. Page header.
2. Summary cards.
3. Alerts.
4. Next job.
5. Needs review.
6. Today timeline preview.
7. Quick actions.

Keep the dashboard as an operational overview. Do not turn it into a full analytics dashboard, requests inbox, or calendar.
