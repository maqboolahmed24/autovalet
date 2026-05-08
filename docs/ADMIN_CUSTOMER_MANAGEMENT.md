# Admin Customer Management

The customer management foundation gives AUTO VALET a private admin-only view of customer records, vehicles, booking history and internal notes.

## Current State

The customer pages use safe mock data from `lib/admin/customers.ts` until database persistence is connected. Mutation routes validate auth, permissions and input, then fail closed with `501` when persistence is unavailable.

No customer data is exposed on public routes.

## Customer List Purpose

`/admin/customers` is a simple operational customer list. It is not a CRM pipeline.

Admins can:

- Search customer records.
- Open a customer profile.
- Check contact details.
- See latest vehicle and location context.
- Understand whether records are placeholder data.

## Search Fields

The list search is prepared for:

- Customer name
- Phone
- Email
- Postcode
- Vehicle make/model

The current mock search filters in-memory records. Production should search normalized customer, booking and vehicle rows.

## Customer Profile Data

`/admin/customers/[id]` shows:

- Customer name
- Phone
- Email
- Total bookings
- Last booking
- Latest location summary
- Contact actions
- Vehicles
- Booking history
- Private admin notes
- Privacy reminder

Contact actions use `tel:`, `sms:` and `mailto:` links.

## Vehicle History

Vehicle history shows:

- Make
- Model
- Size
- Last service
- Booking count

Future persistence should derive this from `vehicles` joined through bookings. Duplicate vehicle detection and merging can be added later.

## Booking History

Booking history shows:

- Reference
- Human-readable status label
- Date
- Service
- Vehicle
- Estimated total
- Final total, when set
- Link to booking/request detail

Raw booking status enum values must never be shown to admins.

## Private Notes

Private customer notes are not visible to customers.

The new descriptor `lib/db/schema/customer-notes.ts` defines:

- `id`
- `customer_id`
- `admin_id`
- `note`
- `created_at`
- `updated_at`

Notes require `edit_customers`. Admins should avoid storing unnecessary sensitive information.

## Privacy Rules

Customer contact details, addresses, vehicles and notes are personal data.

Rules:

- Use customer data only for booking and service management.
- Do not send customer PII to analytics.
- Do not expose customer details publicly.
- Keep private notes private.
- Do not store card details.
- Prepare future data access, correction, export and deletion workflows.

## API Contracts

### List Customers

```http
GET /api/admin/customers?search=sarah
```

Requires `view_customers`.

Response:

```json
{
  "success": true,
  "data": {
    "isMockData": true,
    "customers": []
  }
}
```

### Customer Profile

```http
GET /api/admin/customers/[id]
```

Requires `view_customers`.

Response:

```json
{
  "success": true,
  "data": {
    "customer": {
      "fullName": "Sarah Wilson"
    },
    "vehicles": [],
    "bookingHistory": [],
    "notes": []
  }
}
```

### Add Customer Note

```http
POST /api/admin/customers/[id]/notes
```

Requires `edit_customers`.

Request:

```json
{
  "note": "Customer prefers morning appointments."
}
```

Current placeholder response when persistence is unavailable:

```json
{
  "success": false,
  "error": {
    "code": "PERSISTENCE_NOT_CONFIGURED",
    "message": "Customer notes are not connected to database persistence yet.",
    "details": {}
  }
}
```

## Permissions

- View list/profile: `view_customers`
- Add private notes: `edit_customers`

Admin auth is still fail-closed until real sessions are connected.

## Persistence-Not-Configured Behavior

Read pages use mock data to keep the UI reviewable.

Note creation must not fake a save. It returns `501 PERSISTENCE_NOT_CONFIGURED` after route guard and validation pass.

## Future Export/Delete Flow

A later privacy/GDPR prompt should add:

- Customer data export.
- Deletion or anonymization requests.
- Marketing/photo consent withdrawal.
- Retention policy enforcement.
- Customer merge tooling.

## Edge Cases

- Duplicate customers with same email or phone.
- Customer has no bookings.
- Customer has multiple vehicles.
- Customer asks for data deletion.
- Missing email.
- Invalid phone number.
- Admin note contains sensitive information.
- Read-only admin access.
- Booking history includes declined or expired bookings.
- Customer records may be merged later.
