# AUTO VALET Slot Generation and Conflicts

This document defines the first real slot-generation and conflict-prevention layer for AUTO VALET. It keeps the customer-facing language as a requested time, not a confirmed appointment.

## Slot Interval Rule

- Customer request slots are generated in `15` minute increments.
- The slot label is the customer-facing service start time in `Europe/London`.
- The customer sees service start time and estimated service duration.

## Travel Buffer Rule

- AUTO VALET uses a fixed `45` minute travel buffer after each location visit.
- The internal blocked window is:

```text
requested start + service duration + travel buffer
```

- Multi-vehicle bookings at the same address add one travel buffer after the whole visit, not one buffer per vehicle.
- The travel buffer is internal scheduling protection. It is not presented as customer service time.

## Working Hours Rule

- The service itself must finish inside working hours.
- Travel buffer may extend after closing by default.
- Closed days and custom hours come from the availability foundation.
- Blocked-time overrides remove slots when they overlap the candidate service or travel-buffer block.

## Blocking Statuses

These booking statuses block public slots:

- `payment_hold`
- `pending_admin_review`
- `approved`
- `on_the_way`
- `arrived`
- `in_progress`

These statuses do not block public slots:

- `declined`
- `cancelled_by_customer`
- `cancelled_by_admin`
- `expired`
- `payment_failed`
- `refunded`
- `completed`
- `no_show`

`no_show` is historical only and should not continue blocking future availability.

## Overlap Formula

Two internal booking windows overlap when:

```text
new_start < existing_blocked_until
AND
new_blocked_until > existing_start
```

Minute-based local checks use the same formula:

```text
new_start_minutes < existing_end_minutes
AND
new_end_minutes > existing_start_minutes
```

If a previous `blockedUntil` exactly equals a candidate start, the slot is valid because the ranges do not overlap.

## API Contract

```http
POST /api/available-slots
```

Request:

```json
{
  "date": "2026-05-18",
  "packageId": "maintenance",
  "vehicles": [
    {
      "size": "medium",
      "addons": ["engine_bay_clean"]
    }
  ],
  "vehicleCount": 1
}
```

Response:

```json
{
  "success": true,
  "data": {
    "date": "2026-05-18",
    "timezone": "Europe/London",
    "serviceDurationMinutes": 95,
    "travelBufferMinutes": 45,
    "slots": [
      {
        "start": "2026-05-18T08:00:00.000Z",
        "label": "09:00",
        "serviceEndsAt": "2026-05-18T09:35:00.000Z",
        "blockedUntil": "2026-05-18T10:20:00.000Z",
        "serviceDurationMinutes": 95,
        "travelBufferMinutes": 45
      }
    ]
  },
  "message": "Available request times loaded."
}
```

The API currently returns UTC ISO strings calculated from `Europe/London` local slot labels. Production persistence must continue storing UTC and displaying `Europe/London`.

## Current Implementation

- Slot generation lives in `lib/availability/slots.ts`.
- Conflict helpers live in `lib/availability/conflicts.ts`.
- The public endpoint lives at `app/api/available-slots/route.ts`.
- `SlotStep` fetches slots after the customer selects a date and required service details exist.
- The endpoint uses the central duration engine.

## Future Database Conflict Query

The endpoint currently uses an empty `existingBookings` list because the database client is not configured yet.

Before payment holds are enabled, replace that TODO with a PostgreSQL query for bookings on the requested business date whose status is calendar-blocking:

```text
payment_hold
pending_admin_review
approved
on_the_way
arrived
in_progress
```

The query should return `requested_start_at` and `blocked_until` as UTC timestamps.

## Race-Condition Warning

Showing a slot does not reserve it. Payment hold creation and admin approval must re-check conflicts inside a transaction before writing.

Future payment-hold and approval flows should use one of:

- A calendar resource lock per business/day.
- PostgreSQL range/exclusion constraints for blocking windows.
- `SELECT ... FOR UPDATE` around the relevant calendar records.

## Test Cases

Future unit or integration tests should cover:

1. Small Maintenance creates a `105` minute blocked window.
2. Medium Maintenance with engine bay clean includes add-on duration.
3. A slot is invalid if service ends after working hours.
4. A slot is invalid if it overlaps blocked time.
5. A slot is invalid if it overlaps an approved booking.
6. A slot is invalid if it overlaps `payment_hold`.
7. A slot is valid if previous `blockedUntil` equals candidate start.
8. No slots are returned on a closed day.
