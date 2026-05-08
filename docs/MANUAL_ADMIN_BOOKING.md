# AUTO VALET Manual Admin Booking

Manual booking creation lets AUTO VALET keep the public calendar accurate when enquiries arrive by phone, Instagram, WhatsApp, referral, existing customer contact, or direct admin entry.

This is not a full admin dashboard build. It creates the Add Booking page, form sections, API boundary, and domain function signatures needed before database persistence and admin auth are connected.

## Why Manual Booking Exists

AUTO VALET may promise or discuss work outside the public booking form. Those jobs must still:

- Use the central service catalogue.
- Use central pricing and duration calculations.
- Validate service-zone rules.
- Respect working hours and blocked time.
- Re-check calendar conflicts before saving.
- Block public availability when status is `approved` or `pending_admin_review`.

Manual bookings must not bypass the same operational rules as paid public booking requests.

## Admin Fields

The admin form is split into beginner-friendly sections:

| Section | Fields |
| --- | --- |
| Customer | Full name, phone, email |
| Vehicle | Make, model, size |
| Service | Package, add-ons, vehicle count |
| Location | Postcode, full address, parking available, parking notes, access notes, zone note |
| Date and time | Date, start time, service duration, blocked-until preview, conflict check |
| Payment | Booking source, status, deposit status, deposit paid, payment method, notes |

The UI copy is operational rather than customer-facing. It uses "Create Approved Booking" or "Create Pending Request", not "Request a Booking".

## Booking Source Options

Manual source values:

```text
admin_manual
phone
instagram
whatsapp
referral
```

Do not use `public_booking` for admin-created bookings.

## Status Options

Manual creation currently supports:

```text
pending_admin_review
approved
```

Manual creation must not create:

```text
in_progress
completed
no_show
cancelled_by_customer
cancelled_by_admin
refunded
```

If the admin creates an `approved` booking, the lifecycle layer validates `pending_admin_review -> approved` with actor `admin`.

## Conflict Rules

Approved and pending manual bookings must block public slot availability.

Before persistence is enabled, the UI can preview working-hours availability through `/api/available-slots`, but this is not a reservation.

The future database implementation must:

1. Start a database transaction.
2. Lock the calendar/day or relevant booking rows.
3. Calculate service duration and one travel buffer for the location visit.
4. Validate the service ends inside working hours.
5. Check overlap against blocking statuses:

```text
payment_hold
pending_admin_review
approved
on_the_way
arrived
in_progress
```

6. Reject conflicts with `409 SLOT_UNAVAILABLE` or `409 APPROVAL_CONFLICT`.
7. Create audit log `manual_booking_created`.

## Payment And Deposit Options

Manual booking supports:

```text
depositStatus: unpaid | paid | waived
paymentMethod: cash | bank_transfer | card_reader | online_payment_link | other
depositPaidMinor: integer GBP pence
```

Admin can record an offline deposit or create a no-payment manual booking when policy allows. Remaining balance is calculated from estimated total minus recorded deposit, but final total can still change after inspection.

No card details are stored.

## API Contract

```http
POST /api/admin/bookings
```

Request:

```json
{
  "source": "phone",
  "status": "approved",
  "customer": {
    "fullName": "Sarah Wilson",
    "phone": "07123456789",
    "email": "sarah@example.com"
  },
  "vehicle": {
    "make": "BMW",
    "model": "3 Series",
    "size": "medium"
  },
  "service": {
    "packageId": "maintenance",
    "addons": ["engine_bay_clean"],
    "vehicleCount": 1
  },
  "location": {
    "postcode": "CR0 1AA",
    "fullAddress": "Full address",
    "parkingAvailable": "yes",
    "parkingNotes": "",
    "accessNotes": ""
  },
  "schedule": {
    "date": "2026-05-18",
    "startTime": "09:00"
  },
  "payment": {
    "depositStatus": "paid",
    "depositPaidMinor": 3000,
    "paymentMethod": "bank_transfer",
    "notes": "Deposit taken by bank transfer"
  }
}
```

Success response after admin auth and persistence are connected:

```json
{
  "success": true,
  "data": {
    "bookingReference": "AV-2026-8F3K",
    "status": "approved"
  },
  "message": "Manual booking created."
}
```

Current safe response while admin auth is missing:

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

## Domain Layer

Manual booking logic lives in `lib/admin/manual-booking.ts`.

Important exports:

- `CreateManualBookingInput`
- `CreateManualBookingResult`
- `parseCreateManualBookingInput`
- `validateManualBookingInput`
- `buildManualBookingDraft`
- `calculateManualBookingPreview`
- `createManualBooking`

The domain layer is wired to:

- `calculateBookingPrice`
- `calculateBookingDuration`
- `validateServiceZone`
- `generateAvailableSlots`
- `assertBookingTransition`

Database persistence is intentionally not enabled yet. The future implementation must create customer, booking, vehicle, booking add-ons, payment records, and audit logs in one transaction.

## Security

The admin auth foundation is present, but database-backed session persistence is not connected yet. Therefore `/api/admin/bookings` returns a safe `501 ADMIN_AUTH_NOT_CONFIGURED` response and does not mutate anything.

Before enabling persistence:

- Connect secure admin sessions.
- Keep the `create_manual_booking` permission guard in place.
- Add CSRF/session protections appropriate to the chosen auth layer.
- Write audit logs for every successful manual booking and override.

## Future Improvements

- Existing customer search.
- Multiple vehicle detail forms.
- Admin override reason fields for outside-zone, working-hours, and deposit exceptions.
- Customer notification toggle.
- Real conflict query from PostgreSQL.
- Save draft manual booking flow.
- Manual blocked-time creation as a separate workflow.
