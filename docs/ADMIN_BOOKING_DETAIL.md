# Admin Booking Detail

The admin booking detail screen is the read-only review surface used after opening a request from the inbox or opening an approved job from admin navigation.

## Purpose

The screen helps the admin quickly answer:

1. Is the deposit paid?
2. Is there a calendar clash?
3. Is the location inside zone or a valid outside-zone volume request?
4. Are customer details complete?
5. Are vehicle details complete?
6. What service and add-ons were selected?
7. What is the requested time, service end and buffer?
8. Is there anything risky in notes, access or parking?
9. What action should happen next?

## Data Model

Booking detail data lives behind `lib/admin/booking-detail.ts`.

Main shape:

```ts
export type AdminBookingDetailData = {
  id: string;
  reference: string;
  status: BookingStatus;
  statusLabel: string;
  requestedDateLabel: string;
  requestedTimeLabel: string;
  serviceEndLabel: string;
  blockedUntilLabel: string;
  serviceLabel: string;
  packageId: PackageId;
  vehicle: {
    make: string;
    model: string;
    size: VehicleSize;
    label: string;
  };
  addons: {
    id: AddonId;
    label: string;
    priceLabel: string;
  }[];
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  location: {
    fullAddress: string;
    postcode: string;
    zoneLabel: string;
    isOutsideZone: boolean;
    parkingAvailable: string;
    parkingNotes?: string;
    accessNotes?: string;
  };
  payment: {
    depositPaidLabel: string;
    estimatedTotalLabel: string;
    finalTotalLabel?: string;
    balanceDueLabel: string;
    paymentStatusLabel: string;
  };
  checks: ApprovalCheck[];
  actions: {
    canApprove: boolean;
    canDecline: boolean;
    canReschedule: boolean;
    canCancel: boolean;
    canAdjustPrice: boolean;
    canMarkBalancePaid: boolean;
  };
};
```

The current implementation adds internal `financials` minor-unit values so existing final-price and balance components can be mounted when allowed. Money remains stored and calculated in integer GBP pence.

Current source is safe mock data with generic customer labels. It is visibly marked in the UI and must be replaced with database-backed booking lookup before launch.

## Approval Checklist

Checklist states:

- `success`
- `warning`
- `danger`
- `neutral`

Rules:

- Deposit unpaid -> danger
- Conflict detected -> danger
- Outside-zone volume request -> warning
- Parking unavailable or unknown -> warning
- Complete customer and vehicle data -> success
- Price may vary notice -> neutral reminder

The conflict check currently uses placeholder in-memory windows and the central overlap helper. Production must query blocking bookings and overrides.

## Info Card Sections

The detail screen uses reusable cards:

- `BookingHeroCard`
- `ApprovalChecklist`
- `InfoCard`
- `InfoRow`
- `ContactActions`
- `AdminNotesCard`
- `BookingActivityLog`

Mobile order:

1. Back link
2. Hero card
3. Approval checklist
4. Customer
5. Vehicle
6. Service
7. Location
8. Payment
9. Customer notes
10. Final price tools, if allowed
11. Balance tools, if allowed
12. Admin notes
13. Activity log
14. Sticky action bar

## Action Bar

The action bar shows future actions by booking state:

- Pending request: Decline, Suggest new time, Approve Booking
- Approved booking: Cancel, Start job, Mark complete
- Other states: disabled placeholder action

Approve, decline and reschedule buttons open decision sheets. The sheets submit to guarded API routes and fail safely until persistence is connected. Cancellation and job-day actions remain disabled placeholders until their dedicated workflows are connected.

## API Contract

```http
GET /api/admin/bookings/[id]
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

Future success response:

```json
{
  "success": true,
  "data": {
    "reference": "AV-2026-DEMO1",
    "statusLabel": "Needs review",
    "serviceLabel": "Deep Clean"
  },
  "message": "Booking detail data is placeholder until database persistence is connected."
}
```

## Routes

- `/admin/requests/[id]` opens the request detail.
- `/admin/bookings/[id]` is an alias for approved or calendar-origin bookings.
- `/api/admin/bookings/[id]` returns the same data shape for future client-side refreshes.

## Empty, Loading And Error States

Current server-rendered mock detail always returns a placeholder booking. Future database integration should:

1. Return 404 if the booking is not found.
2. Show a clear "Booking not found" empty state.
3. Preserve the back link.
4. Avoid exposing raw database ids or provider ids.
5. Avoid showing customer PII to admins without `view_bookings`.

## Future Database Integration

Replace mock data with queries that:

1. Load booking, customer, vehicle, add-ons and payment rows.
2. Format dates and times in `Europe/London`.
3. Re-check calendar conflict risk using blocking statuses.
4. Show zone status without exposing technical enum names.
5. Include deposit, estimate, final total and balance fields.
6. Load audit/activity rows.
7. Load admin notes.

Mutation buttons must remain disabled until the next approval/reschedule workflow adds guarded route handlers.
