# AUTO VALET Database Schema

This document defines the first database foundation for AUTO VALET. It follows the project rule that customers submit paid booking requests and AUTO VALET manually approves, declines, or reschedules every request.

## Current Implementation State

The repo does not currently include `package.json`, Drizzle, a PostgreSQL client, or migration tooling. To avoid breaking the app, the schema in `lib/db/schema/*` is represented as dependency-free TypeScript descriptors.

Before creating real migrations, install and configure:

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit
```

Then wire:

```text
DATABASE_URL
```

The future Drizzle implementation should convert the current descriptors into `pgTable` definitions and generate migrations from them. Raw SQL migrations are allowed where PostgreSQL constraints are stronger than ORM helpers.

## Domain Type Sources

Shared booking types now live in:

- `lib/booking/types.ts`
- `lib/booking/statuses.ts`
- `lib/pricing/types.ts`

UI components must import shared domain types from `lib/booking/types.ts` instead of defining core booking types inside the stepper.

## Money Rule

All money is stored as integer minor units in GBP pence:

- `5500` means `£55`
- `3000` means `£30`
- `currency` must be `GBP`

Do not store money as floats.

## Date Rule

Store timestamps as UTC `timestamptz` values. Display dates and times to customers and admins in `Europe/London`.

Availability override dates use PostgreSQL `date` because they represent local business dates, not exact instants.

## Tables

### customers

Stores contact details for booking requests and future customer profiles.

Key fields:

- `id uuid primary key`
- `full_name text not null`
- `phone text not null`
- `email text not null`
- `created_at timestamptz`
- `updated_at timestamptz`

### vehicles

Stores vehicles attached to a booking. Multi-vehicle bookings use multiple rows with the same `booking_id`.

Key fields:

- `id uuid primary key`
- `booking_id uuid references bookings(id)`
- `make text not null`
- `model text not null`
- `size text not null`
- `notes text`
- `created_at timestamptz`

### services and service_variants

`services` stores package-level records such as Maintenance and Deep Clean.

`service_variants` stores vehicle-size pricing and duration for each package.

Maintenance defaults:

- Small: `5500`, `60` minutes
- Medium: `6500`, `75` minutes
- Large / 4x4: `7500`, `90` minutes

Deep Clean must support size-based pricing and duration:

- Small: from `16000`, estimated `150` minutes
- Medium: from `16500`, estimated `180` minutes
- Large / 4x4: from `17000`, estimated `210` minutes

### addons

Stores optional extras with price and duration.

Required add-ons:

- `engine_bay_clean`: `3000`
- `windscreen_repellent`: `3000`
- `exhaust_tips_polished`: `2000`
- `leather_deep_clean`: `5000`
- `convertible_roof_treatment`: `4000`
- `excess_pet_hair_removal`: `3000`
- `liquid_decon_clay_bar`: `5000`

Every add-on must support `extra_duration_minutes`, even if admin changes values later.

### bookings

Central booking request table.

Important lifecycle fields:

- `reference text unique not null`
- `status text not null`
- `source text not null default 'public_booking'`
- `requested_start_at timestamptz`
- `service_ends_at timestamptz`
- `blocked_until timestamptz`
- `approved_at timestamptz`
- `declined_at timestamptz`

Important pricing fields:

- `estimated_total_minor integer`
- `final_total_minor integer`
- `deposit_due_minor integer`
- `deposit_paid_minor integer`
- `balance_due_minor integer`
- `balance_paid_minor integer`
- `currency text default 'GBP'`
- `price_adjustment_reason text`

Important service-area and access fields:

- `full_address text not null`
- `postcode text not null`
- `normalized_postcode text not null`
- `zone_status text not null`
- `vehicle_count integer default 1`
- `parking_available text`
- `parking_notes text`
- `access_notes text`
- `extra_notes text`
- `marketing_photo_consent boolean default false`

### booking_addons

Join table between bookings, vehicles, and add-ons. Stores the price and duration at booking time so historical bookings do not change when admin edits pricing later.

### payments

Tracks deposit, balance, refund, and transfer payment records.

Important fields:

- `booking_id uuid references bookings(id)`
- `gateway text not null`
- `gateway_payment_id text`
- `gateway_checkout_session_id text`
- `idempotency_key text unique`
- `amount_minor integer not null`
- `status text not null`
- `payment_type text not null`
- `paid_at timestamptz`
- `refunded_at timestamptz`

Card details must never be stored directly.

### service_zones

Stores admin-managed approved service areas.

Supported `zone_type` values:

- `exact_postcode`
- `outward_code`
- `postcode_district`
- `region`

`zone_type + normalized_value` should be unique for active zones. Outside-zone requests may only proceed when the volume rule allows it, currently 3+ vehicles at the same address by default.

### availability_rules and availability_overrides

`availability_rules` stores normal weekly working hours.

`availability_overrides` stores closed days, partial days, manual blocks, or special opening windows.

### admin_users

Stores admin login records with future-ready 2FA support.

Roles:

- `owner`
- `manager`
- `staff`
- `read_only`

### gallery_items

Stores future before/after and single image gallery items. Gallery items must respect marketing/photo consent and must not expose registration plates or personal details.

### audit_logs

Stores important admin actions such as approval, decline, reschedule, manual booking creation, price adjustment, refund handling, and zone overrides.

### webhook_events

Stores payment webhook events by unique `event_id`. Webhook handling must be idempotent.

## Required Indexes

Implemented in descriptors:

- `bookings.reference`
- `bookings.status`
- `bookings.requested_start_at`
- `bookings.blocked_until`
- `bookings.normalized_postcode`
- `bookings.customer_id`
- `vehicles.booking_id`
- `payments.booking_id`
- `payments.gateway_payment_id`
- `payments.idempotency_key`
- `webhook_events.event_id`
- `service_zones.zone_type + service_zones.normalized_value`
- `availability_overrides.date`

## Conflict Prevention

The final slot/conflict implementation must be transaction-safe.

Calendar blocking statuses:

- `payment_hold`
- `pending_admin_review`
- `approved`
- `on_the_way`
- `arrived`
- `in_progress`

Non-blocking statuses:

- `declined`
- `reschedule_requested`
- `completed`
- `cancelled_by_customer`
- `cancelled_by_admin`
- `no_show`
- `expired`
- `payment_failed`
- `refunded`

The slot engine must calculate:

```text
blocked_until = requested_start_at + service_duration_minutes + travel_buffer_minutes
```

Multi-vehicle bookings at the same address get one travel buffer for the whole visit, not one buffer per vehicle.

Final overlap prevention will be implemented in the slot/conflict prompt using database transactions and possibly a PostgreSQL range/exclusion constraint over blocking booking windows.

## Not Implemented Yet

This foundation does not implement:

- Booking API endpoints
- Payment creation
- Payment webhooks
- Real Drizzle client
- Migrations
- Slot generation
- Conflict locking
- Admin approval actions

Those must be added in later prompts without changing the booking request model.
