# Admin Approval Workflows

The admin decision workflows are the first mutation layer for booking requests. They are intentionally fail-closed until database persistence, audit logs and notification delivery are connected.

Payment does not approve a booking. A paid deposit moves a request to `pending_admin_review`; only an admin approval workflow can move it to `approved`.

## Approval Checks

Approval is allowed only when:

1. Booking status is `pending_admin_review`.
2. Deposit is confirmed.
3. Calendar conflict re-check passes.
4. Customer details are complete.
5. Vehicle details are complete.
6. Zone status is acceptable.
7. Service duration and blocked time are calculated.

The domain function uses `canTransitionBookingStatus` before status changes. It also uses the central conflict helper so a slot can be rechecked immediately before persistence.

Current behavior: route handlers load mock booking detail data and return `APPROVAL_PERSISTENCE_NOT_CONFIGURED`. They do not fake approval.

## Approve API

```http
POST /api/admin/bookings/[id]/approve
```

Request body can be an empty JSON object:

```json
{}
```

Future success response:

```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "status": "approved",
    "approvedAt": "2026-05-18T10:15:00.000Z"
  },
  "message": "Booking approved."
}
```

Current safe response while persistence is missing:

```json
{
  "success": false,
  "error": {
    "code": "APPROVAL_PERSISTENCE_NOT_CONFIGURED",
    "message": "Booking approval is not connected to database persistence yet.",
    "details": {}
  }
}
```

Invalid status, unpaid deposit or conflict returns `409`.

## Decline API

```http
POST /api/admin/bookings/[id]/decline
```

Request:

```json
{
  "reason": "outside_service_area",
  "depositAction": "refund",
  "notes": "Outside the usual zone and no volume exception applies."
}
```

Allowed decline reasons:

- `outside_service_area`
- `slot_no_longer_suitable`
- `vehicle_or_service_unsuitable`
- `customer_requested`
- `duplicate_request`
- `other`

Deposit actions:

- `refund`
- `transfer`
- `no_deposit_action_required`

Declining releases the requested slot once persistence is connected. Refund and transfer actions are planned through the existing policy/payment foundations and must not be faked.

## Reschedule API

```http
POST /api/admin/bookings/[id]/reschedule
```

Request:

```json
{
  "proposedDate": "2026-05-18",
  "proposedStartTime": "09:00",
  "message": "This time is suggested because the original slot needs review."
}
```

Allowed from:

- `pending_admin_review`
- `approved`
- `reschedule_requested`

The route validates the proposed time against the slot-generation engine. The current schema does not include fields for `proposed_start_at` or `proposed_expires_at`, so persistence returns a safe `501` until a migration is added.

## Deposit Handling

Decline requires a deposit action:

- If a deposit is paid, choose refund or transfer.
- If no deposit is paid, choose no deposit action required.

Refunds and transfers must use the payment policy foundations and provider adapters once configured. The current workflow does not return fake financial success.

## Conflict Re-Check

Approval and reschedule must re-check availability. Production implementation should:

1. Lock the booking row.
2. Query blocking bookings for the same business date.
3. Exclude the current booking id.
4. Re-run overlap checks inside the transaction.
5. Save status changes only after the slot remains available.

## Notifications

Future successful persistence should dispatch:

- Approve -> `booking_approved`
- Decline -> `booking_declined`
- Reschedule -> `reschedule_suggested`

Notification failures must not corrupt an already persisted booking decision. They should be logged and surfaced to admin separately.

## Audit Logs

Every successful decision must write an audit log with:

- Admin id
- Booking id
- Previous status
- New status
- Reason or message
- Deposit action, when applicable
- Timestamp

## Edge Cases

1. Admin double-clicks approve: use row locks and idempotency guards.
2. Booking already approved: return `409`.
3. Deposit unpaid: block approval.
4. Slot conflict appears during approval: return `409`.
5. Booking declined and refund fails: do not fake refund success; surface provider error.
6. Reschedule slot unavailable: return `409`.
7. Customer does not respond to reschedule: expiry policy is required.
8. Admin lacks permission: return `403`.
9. Notification fails: log failure, do not expose raw provider error.
10. Persistence not configured: return `501`.

## UI

`BookingActionBar` opens mobile-first decision sheets:

- `ApproveBookingSheet`
- `DeclineBookingSheet`
- `RescheduleBookingSheet`

The sheets submit to the admin API routes and display safe errors. They do not use browser confirm dialogs.
