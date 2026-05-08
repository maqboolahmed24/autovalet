# Admin Requests Inbox

The Requests inbox is the operational queue for booking requests that need admin attention. It is intentionally simpler than a CRM: filter, search, review the right request, then open the future detail workflow.

## Purpose

The inbox helps AUTO VALET see:

1. Paid requests needing review.
2. Outside-zone requests.
3. Payment holds.
4. Reschedule requests.
5. Recently approved or declined requests when filtered.

The default view is `Needs review`.

## Data Model

Request inbox data lives behind `lib/admin/requests.ts`.

```ts
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
```

The current source is safe mock data with generic customer labels. It is marked in the UI and must be replaced by database queries before launch.

## Filters

Filter chips:

- Needs review
- Outside-zone
- Payment hold
- Reschedule
- Approved
- Declined
- All

The chips are horizontally scrollable on mobile and include counts from the current inbox source.

## Search

The search UI supports:

- Customer name
- Booking reference
- Postcode
- Vehicle make/model

Current search is in-memory against placeholder data. The database implementation should move this into a query once persistence is connected.

## Grouping

Requests are grouped into:

- Today
- Tomorrow
- This week
- Older

Empty groups are hidden.

## Status Labels

The inbox uses admin-facing label helpers from `lib/booking/status-labels.ts`.

Customer-unsafe or technical labels must not appear in the UI. Use:

- Needs review
- Payment in progress
- Outside-zone request
- Deposit paid
- Approved
- Declined

Avoid raw values such as `pending_admin_review`, `payment_hold`, or `outside_zone_volume_exception`.

## Request Actions

Card action labels:

- Pending review -> Review
- Payment hold -> View hold
- Approved -> Open booking
- Declined -> View details
- Reschedule -> Review

Cards currently link to `/admin/requests/[id]`, which is a placeholder detail route until the approval, decline and reschedule workflows are implemented.

## API Contract

```http
GET /api/admin/bookings/requests?filter=needs_review&search=example
```

The route requires `view_bookings` through `requireAdmin`.

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

Future successful response:

```json
{
  "success": true,
  "data": {
    "counts": {
      "needs_review": 2,
      "outside_zone": 2,
      "payment_hold": 1,
      "reschedule": 1,
      "approved": 1,
      "declined": 1,
      "all": 6
    },
    "groups": []
  },
  "message": "Requests inbox data is placeholder until database persistence is connected."
}
```

## Future Database Integration

Replace mock data with queries that:

1. Load booking rows by status and requested date.
2. Join customer, vehicle, payment and zone summary fields.
3. Count filters without exposing unnecessary PII.
4. Search by customer name, reference, postcode and vehicle label.
5. Keep `payment_hold` visible until expiry or webhook resolution.
6. Keep outside-zone warnings clear without exposing internal enum names.

## Empty States

Needs review empty state:

- Title: `No requests waiting.`
- Description: `New paid booking requests will appear here.`

Search empty state:

- Title: `No matching requests.`
- Description: `Try a different customer name, postcode or reference.`

## Mobile-First Rules

- Keep the default view focused on needs review.
- Keep filter chips scrollable.
- Keep each card readable and tappable.
- Do not add approve/decline buttons in the inbox.
- Do not turn the inbox into a full CRM.
