# AUTO VALET Master Implementation Direction

Generated for the AUTO VALET build direction from the available source blueprint files in this repo.

## Source Files Checked

The following files are the source basis for this document:

- `blueprint.md`
- `look_and_feel.md`
- `admin_tinbin.md`
- `AUTO_VALET_Blueprint_Completion_Addendum.md`

`AUTO_VALET_Master_Product_Specification.md` was requested as an optional higher-priority source, but it is not present in this repo at generation time.

No real external links were present in the source files. The only URL-like value found was a placeholder Stripe checkout URL in an API example.

## Source Priority

If source files conflict, use this order:

1. `AUTO_VALET_Master_Product_Specification.md`, if later added
2. `AUTO_VALET_Blueprint_Completion_Addendum.md`
3. `blueprint.md`
4. `look_and_feel.md`
5. `admin_tinbin.md`

This document does not replace the source blueprint files. It is the build direction derived from them. If the source files change, this document should be reviewed and updated.

## 1. Project Summary

AUTO VALET is a premium mobile car detailing website and booking request platform.

It has two major products:

- Public customer website
- Private admin web app

The public site must feel minimalist, premium, dark, calm, authentic, cinematic, and image-led. It should guide customers toward submitting a paid booking request.

The admin app must feel like a beginner-friendly mobile booking control room. It should make it clear what needs review, what is paid, what is happening today, what blocks the calendar, and what action the admin should take next.

The central product rule is non-negotiable:

```text
AUTO VALET does not offer instant confirmed bookings.
Customers submit paid booking requests.
Admin manually approves, declines, or reschedules every request.
```

## 2. Non-Negotiable Product Rules

### Product Structure

- The project has a public customer website and a private admin web app.
- Customer-facing booking is a request flow, not an instant calendar confirmation.
- Admin approval is mandatory for every customer-submitted booking.
- Guest checkout is the MVP default. Customer accounts are a later enhancement.

### Booking Rules

- Every booking starts as a request, not a confirmed appointment.
- Deposit must be paid before the request reaches admin review.
- A selected slot is temporarily protected during checkout by a payment hold.
- A successful payment webhook moves the booking to `pending_admin_review`.
- Admin approval moves the booking to `approved`.
- Admin decline releases the slot and triggers refund or transfer handling according to policy.
- Pending paid requests block the calendar.
- Approved bookings block the calendar.
- Expired, declined, failed, refunded, no-show, and cancelled requests do not block future availability.
- Slot generation must prevent double-booking.
- Booking conflict checks must run inside database transactions or equivalent locking.

### Calendar Blocking Statuses

These statuses block customer availability:

```text
payment_hold
pending_admin_review
approved
on_the_way
arrived
in_progress
```

These statuses do not block future availability:

```text
declined
expired
payment_failed
cancelled_by_customer
cancelled_by_admin
no_show
refunded
partially_refunded
```

### Scheduling Defaults

- Slot interval: 15 minutes.
- Travel buffer: 45 minutes after each location visit.
- Same-day booking: disabled by default.
- Minimum notice: 24 hours.
- Maximum booking window: 60 days ahead.
- Service must finish inside working hours.
- Travel buffer may extend after closing by default.

### Multi-Vehicle Rules

- Multi-vehicle bookings at one address are one location visit.
- Add the service and add-on duration for each vehicle.
- Add the optional same-location handover gap if configured.
- Add one 45-minute travel buffer after the whole visit.
- Do not add one travel buffer per vehicle when all vehicles are at the same address.

## 3. Full Customer Journey

### Public Pages

The customer-facing site must include:

- Homepage
- Services and pricing
- Gallery / before-after section with premium placeholders until real images exist
- Multi-step booking request flow
- Deposit checkout
- Payment processing screen
- Booking request received screen
- Payment failed screen
- Booking expired screen
- Booking status page
- Reschedule response page
- Booking approved page
- Booking declined page
- FAQ page
- Contact page
- Policy pages

### Homepage Structure

The homepage should follow this order:

1. Hero
2. Trust strip
3. Services preview
4. Premium vertical image story
5. How it works
6. Pricing preview
7. Add-ons preview
8. Service area and deposit notice
9. Final booking CTA
10. Sticky mobile booking CTA after the hero

The hero message should communicate:

```text
AUTO VALET
Premium mobile detailing, wherever your car is parked.
Maintenance cleans, deep cleans and finishing extras delivered with care.
Deposit required. Bookings confirmed after approval.
```

### Booking Request Flow

Use one clear decision per mobile step:

1. Choose package: Maintenance or Deep Clean.
2. Choose vehicle size: Small, Medium, Large / 4x4.
3. Choose add-ons.
4. Enter postcode and address.
5. Confirm number of vehicles at the location.
6. Choose requested date and time from valid slots.
7. Enter customer details.
8. Enter vehicle make, model, access, parking, and notes.
9. Confirm optional marketing photo consent.
10. Review booking estimate, deposit, balance, service area result, and policies.
11. Pay deposit.
12. See the correct post-payment state.

Use the phrase `requested time`, not `confirmed time`, until admin approval has happened.

### Required Customer Fields

- Full name
- Phone number
- Email address
- Vehicle make
- Vehicle model
- Vehicle size
- Package
- Address
- Postcode
- Requested date and time
- Parking available: yes, no, or not sure
- Customer available on arrival: yes or no
- Policy acknowledgement before payment
- Deposit payment

Optional fields:

- Add-ons
- Extra notes
- Parking notes
- Vehicle access notes
- Marketing photo consent

### Customer Status Labels

Map internal statuses to plain customer language:

| Internal Status | Customer Label |
|---|---|
| `payment_hold` | Deposit payment in progress |
| `pending_admin_review` | Waiting for approval |
| `approved` | Confirmed |
| `declined` | Declined |
| `reschedule_requested` | New time suggested |
| `completed` | Completed |
| `cancelled_by_customer` | Cancelled |
| `cancelled_by_admin` | Cancelled by AUTO VALET |
| `expired` | Expired |

## 4. Full Admin Journey

### Admin App Structure

Mobile bottom navigation:

- Today
- Requests
- Calendar
- Customers
- More

Desktop sidebar:

- Dashboard
- Requests
- Calendar
- Availability
- Service Zones
- Services
- Customers
- Gallery
- Settings

### Core Admin Screens

The admin system must include:

- Today dashboard
- Requests inbox
- Booking detail screen
- Approval checklist
- Calendar timeline
- Manual booking creation
- Availability management
- Service-zone management
- Services, pricing, and deposit settings
- Customer profiles
- Gallery manager
- Job-day workflow
- Payment management
- Audit/activity log views where appropriate

### Today Dashboard

The Today dashboard should immediately answer:

- What jobs are today?
- What requests need approval?
- Is the deposit paid?
- Is the address inside the service zone?
- What is the next job?
- What action should I take next?

Show:

- Pending request count
- Today job count
- Deposits collected this week
- Next approved job
- Requests needing review
- Important alerts such as outside-zone requests or expiring payment holds

### Requests Inbox

Requests are handled like an inbox.

Default filters:

- All
- Needs review
- Outside-zone
- Deposit paid
- Today
- This week

Power features can exist behind simple controls:

- Search by customer
- Search by postcode
- Filter by booking status
- Filter by service
- Filter by date range
- Filter by deposit status

### Booking Detail Screen

The booking detail screen is the most important admin screen.

It must show:

- Booking summary
- Status badge
- Requested date and time
- Service time
- Travel buffer until
- Approval checklist
- Customer details
- Contact actions: call, text, email
- Vehicle details
- Service and add-ons
- Address and postcode
- Zone status
- Notes
- Payment summary
- Internal admin notes
- Activity log
- Sticky action bar

Primary action for pending requests:

```text
Approve Booking
```

Secondary actions:

```text
Decline
Suggest new time
```

### Approval Checklist

The system must calculate and display:

- Deposit paid
- No calendar clash
- Zone accepted
- Duration calculated
- Customer details complete
- Vehicle details complete
- Outside-zone warning when relevant
- Price may vary warning

Approve must be disabled if:

- Deposit is not confirmed
- Booking status is not approvable
- A calendar conflict exists
- Required customer or vehicle information is missing

### Admin Calendar

Mobile default is a day timeline, not a cramped month grid.

Timeline must show:

- Approved bookings
- Pending paid requests
- Payment holds
- Travel buffers
- Blocked time
- Days off
- Available gaps

Example:

```text
09:00 - 10:15  Maintenance - Medium
10:15 - 11:00  Travel buffer
11:00 - 12:30  Deep Clean - Large / 4x4
12:30 - 13:15  Travel buffer
13:15 onward   Available
```

### Manual Booking Creation

Admin must be able to create:

- Approved booking
- Pending request
- Manual deposit-unpaid booking
- Multi-vehicle booking
- Outside-zone booking
- Blocked time

Manual bookings must:

- Validate customer, vehicle, service, address, zone, and time.
- Run the same conflict checks as public bookings.
- Block the public calendar when status is blocking.
- Create an audit log.

### Job-Day Workflow

Approved jobs must support:

- Call customer
- Text customer
- Email customer
- Navigate to address
- Mark on the way
- Mark arrived
- Start job
- Adjust final price
- Mark balance paid or partially paid
- Upload photos if consent allows
- Mark completed
- Cancel
- Mark no-show

Before completion, admin should confirm:

- Final price confirmed
- Balance payment status selected
- Job notes added if needed
- Photos uploaded or skipped

## 5. Booking Lifecycle

### Primary Lifecycle

```text
draft
-> zone_validated
-> payment_hold
-> pending_admin_review
-> approved
-> on_the_way
-> arrived
-> in_progress
-> completed
```

### Decline Lifecycle

```text
pending_admin_review
-> declined
-> refund_or_transfer_deposit
-> slot_released
```

### Failed Payment Lifecycle

```text
payment_hold
-> payment_failed
-> slot_released
```

### Expired Hold Lifecycle

```text
payment_hold
-> expired
-> slot_released
```

### Reschedule Lifecycle

```text
pending_admin_review
-> reschedule_requested
-> customer_accepts_or_declines
-> pending_admin_review or approved or declined
```

### Payment Hold Creation

```pseudo
function createPaymentHold(data, idempotencyKey):
    validateClientInput(data)
    validateServerInput(data)
    zoneResult = validateServiceZone(data.postcode, data.regionName, data.vehicleCount)

    if zoneResult.allowed == false:
        return error("outside_service_area")

    duration = calculateServiceDuration(data.vehicles)
    blockedUntil = data.requestedStartAt + duration + travelBuffer

    begin transaction
        lockScheduleForDate(data.requestedStartAt.date)

        if slotHasConflict(data.requestedStartAt, blockedUntil):
            rollback
            return error("slot_unavailable")

        booking = create booking with:
            status = "payment_hold"
            hold_expires_at = now + 15 minutes
            service_duration_minutes = duration
            travel_buffer_minutes = 45
            blocked_until = blockedUntil
            idempotency_key = idempotencyKey

        checkout = createStripeCheckoutSession(booking, idempotencyKey)
    commit

    return checkoutUrl
```

### Payment Webhook

```pseudo
function handlePaymentSucceeded(event):
    verifyWebhookSignature(event)

    begin transaction
        if webhookEventAlreadyProcessed(event.id):
            commit
            return success

        storeWebhookEvent(event.id)

        booking = getBookingForUpdate(event.bookingId)

        if booking.status != "payment_hold":
            markWebhookProcessed(event.id)
            commit
            return success

        booking.status = "pending_admin_review"
        booking.deposit_paid_amount = event.amount
        booking.payment_status = "deposit_paid"
        booking.paid_at = now

        createBookingEvent("deposit_paid")
        notifyCustomerRequestReceived(booking)
        notifyAdminNewRequest(booking)
        markWebhookProcessed(event.id)
    commit
```

### Admin Approval

```pseudo
function approveBooking(bookingId, adminId, idempotencyKey):
    validateAdminPermission(adminId, "approve_booking")

    begin transaction
        booking = getBookingForUpdate(bookingId)

        if actionAlreadyProcessed(idempotencyKey):
            commit
            return currentBookingState(booking)

        if booking.status != "pending_admin_review":
            rollback
            return error("booking_not_approvable")

        if booking.deposit_paid_amount <= 0:
            rollback
            return error("deposit_not_confirmed")

        lockScheduleForDate(booking.requested_start_at.date)

        if slotHasConflictExcludingSelf(booking):
            rollback
            return error("approval_conflict")

        booking.status = "approved"
        booking.approved_by = adminId
        booking.approved_at = now

        writeAuditLog(adminId, "booking_approved", booking.id)
        createBookingEvent("booking_approved")
        notifyCustomerApproved(booking)
    commit
```

## 6. Vehicle, Service, Pricing, and Duration Rules

### Maintenance

| Vehicle Size | Price | Duration |
|---|---:|---:|
| Small | GBP 55 | 60 mins |
| Medium | GBP 65 | 75 mins |
| Large / 4x4 | GBP 75 | 90 mins |

### Deep Clean

Deep Clean must support size-based pricing and duration.

Recommended defaults from the addendum:

| Vehicle Size | Price | Duration |
|---|---:|---:|
| Small | GBP 160 | 150 mins |
| Medium | GBP 165 | 180 mins |
| Large / 4x4 | GBP 170 | 210 mins |

The exact Deep Clean durations must be editable in admin.

### Add-Ons

Each add-on must store:

- Price
- Extra duration minutes
- Active/inactive status
- Display order

Recommended defaults:

| Add-on | Price | Extra Duration |
|---|---:|---:|
| Engine bay clean | GBP 30 | 20 mins |
| Windscreen repellent | GBP 30 | 15 mins |
| Exhaust tips polished | GBP 20 | 15 mins |
| Leather deep clean | GBP 50 | 35 mins |
| Convertible roof treatment | GBP 40 | 30 mins |
| Removal of excess pet hair | GBP 30 | 45 mins |
| Liquid decon and clay bar | GBP 50 | 60 mins |

### Price Calculation

```pseudo
function calculatePrice(vehicles):
    estimatedTotal = 0

    for vehicle in vehicles:
        estimatedTotal += getServiceVariant(vehicle.packageId, vehicle.size).price

        for addon in vehicle.addons:
            estimatedTotal += addon.price

    depositDue = calculateDeposit(estimatedTotal, vehicles.count)
    balanceDue = estimatedTotal - depositDue

    return { estimatedTotal, depositDue, balanceDue }
```

### Duration Calculation

```pseudo
function calculateServiceDuration(vehicles):
    duration = 0

    for vehicle in vehicles:
        duration += getServiceVariant(vehicle.packageId, vehicle.size).duration

        for addon in vehicle.addons:
            duration += addon.extraDurationMinutes

    if vehicles.count > 1:
        duration += (vehicles.count - 1) * sameLocationVehicleGapMinutes

    return duration
```

## 7. Service-Zone Rules

The system must not depend on live distance calculation for MVP.

Admin manages approved zones using:

- Exact postcodes
- Outward codes
- Postcode districts
- Region names

Postcodes must be normalized before matching.

Zone validation order:

1. Exact postcode match
2. Outward code match
3. District code match
4. Region name match
5. Outside-zone volume exception
6. Block request

Default outside-zone minimum:

```text
3 vehicles at the same address
```

Outside-zone requests that meet the minimum:

- May proceed to payment.
- Must be clearly flagged to admin.
- Are still not confirmed until admin approval.

Outside-zone requests below the minimum:

- Must be blocked before payment.
- Must show a clear customer message.

```pseudo
function validateServiceZone(postcode, regionName, vehicleCount):
    normalized = normalizePostcode(postcode)
    outward = extractOutwardCode(normalized)
    district = extractDistrictCode(normalized)

    zones = getActiveServiceZones()

    if normalized in zones.exactPostcodes:
        return { allowed: true, zoneStatus: "standard_zone" }

    if outward in zones.outwardCodes:
        return { allowed: true, zoneStatus: "standard_zone" }

    if district in zones.districtCodes:
        return { allowed: true, zoneStatus: "standard_zone" }

    if regionName in zones.regionNames:
        return { allowed: true, zoneStatus: "standard_zone" }

    if vehicleCount >= adminSettings.outsideZoneMinimumVehicles:
        return { allowed: true, zoneStatus: "outside_zone_volume_exception" }

    return {
        allowed: false,
        zoneStatus: "outside_service_area",
        requiredVehicleCount: adminSettings.outsideZoneMinimumVehicles
    }
```

## 8. Payment Rules

- Customer pays a deposit before request submission.
- Payment hold protects the selected slot during checkout.
- Payment webhook changes booking to `pending_admin_review`.
- Abandoned payment holds expire and release the slot.
- Failed payment does not create a valid booking request.
- Admin-declined bookings must support refund or transfer.
- Remaining balance is tracked separately from deposit.
- Admin can adjust final price after seeing vehicle condition.
- Admin can mark balance as paid, partially paid, waived, or unpaid.
- Admin can record balance payment method.
- Never store card details directly.

### Payment Statuses

```text
no_payment_required
payment_hold
deposit_pending
deposit_paid
balance_unpaid
partially_paid
fully_paid
refunded
partially_refunded
transferred
payment_failed
```

### Balance Payment Methods

Recommended MVP options:

- Cash
- Bank transfer
- Card reader / in-person card
- Online payment link
- Other

### Final Price Fields

- `estimated_total`
- `deposit_paid_amount`
- `final_total`
- `balance_due`
- `balance_paid_amount`
- `payment_status`
- `price_adjustment_reason`

## 9. Key Data Entities

### `customers`

- `id`
- `full_name`
- `phone`
- `email`
- `created_at`

### `vehicles`

- `id`
- `booking_id`
- `customer_id`, optional for future customer accounts
- `make`
- `model`
- `size`: `small`, `medium`, `large_4x4`
- `notes`

### `services`

- `id`
- `name`
- `type`: `maintenance`, `deep_clean`
- `active`
- `display_order`

### `service_variants`

- `id`
- `service_id`
- `vehicle_size`
- `price`
- `duration_minutes`

### `addons`

- `id`
- `name`
- `price`
- `extra_duration_minutes`
- `active`
- `display_order`

### `bookings`

- `id`
- `booking_reference`, unique human-readable value such as `AV-2026-0042`
- `source`: `public_booking`, `admin_manual`, `phone`, `instagram`, `whatsapp`, `referral`
- `customer_id`
- `status`
- `package_id`
- `requested_start_at`
- `approved_start_at`, nullable
- `service_duration_minutes`
- `travel_buffer_minutes`
- `blocked_until`
- `estimated_total`
- `deposit_due`
- `deposit_paid_amount`
- `final_total`
- `balance_due`
- `balance_paid_amount`
- `payment_status`
- `full_address`
- `postcode`
- `normalized_postcode`
- `zone_status`
- `vehicle_count`
- `parking_available`
- `parking_notes`
- `vehicle_access_notes`
- `customer_available_on_arrival`
- `marketing_photo_consent`
- `consent_given_at`
- `extra_notes`
- `admin_notes`
- `created_at`
- `approved_at`
- `declined_at`

### `booking_addons`

- `id`
- `booking_id`
- `vehicle_id`, nullable
- `addon_id`
- `price_at_booking`
- `duration_at_booking`

### `payments`

- `id`
- `booking_id`
- `type`: `deposit`, `balance`, `refund`, `transfer`
- `gateway`
- `gateway_payment_id`
- `amount`
- `currency`: `GBP`
- `status`
- `method`
- `paid_at`
- `refunded_at`
- `recorded_by`

### `service_zones`

- `id`
- `zone_type`: `exact_postcode`, `outward_code`, `district`, `region`
- `value`
- `active`
- `notes`

### `availability_rules`

- `id`
- `weekday`
- `start_time`
- `end_time`
- `active`

### `availability_overrides`

- `id`
- `date`
- `start_time`
- `end_time`
- `type`: `closed_day`, `custom_hours`, `blocked_time`
- `reason`

### `gallery_items`

- `id`
- `booking_id`
- `customer_id`
- `title`
- `service_type`
- `vehicle_type`
- `before_image_urls`
- `after_image_urls`
- `finished_image_urls`
- `marketing_consent_verified`
- `hide_number_plate`
- `is_featured`
- `active`
- `created_at`

### `admin_users`

- `id`
- `name`
- `email`
- `password_hash`
- `role`: `owner`, `manager`, `staff`, `read_only`
- `two_factor_enabled`
- `active`
- `created_at`

### `booking_events`

- `id`
- `booking_id`
- `event_type`
- `actor_type`: `customer`, `admin`, `system`
- `actor_id`
- `message`
- `metadata`
- `created_at`

### `audit_logs`

- `id`
- `admin_id`
- `action`
- `entity_type`
- `entity_id`
- `old_value`
- `new_value`
- `created_at`

### `webhook_events`

- `id`
- `gateway`
- `gateway_event_id`, unique
- `event_type`
- `payload`
- `processed_at`
- `created_at`

## 10. Design Principles

### Public Website

The public website must feel:

- Premium
- Minimal
- Dark
- Calm
- Authentic
- Cinematic
- Image-led
- Smooth

Use:

- Deep charcoal and black backgrounds
- Soft white typography
- Muted champagne accent
- Large spacing
- Big confident headings
- Premium image placeholders until real images exist
- Subtle scroll reveals
- Tactile buttons
- Sticky mobile CTA after the hero

Avoid:

- Cheap sales wording
- Loud banners
- Generic car-wash styling
- Random low-quality stock photos
- Noisy animations
- Auto-playing distracting carousels
- Cluttered overlays

### Admin App

The admin app must feel:

- Calm
- Beginner-friendly
- Mobile-first
- Operational
- Powerful underneath
- Clear at a glance

Use:

- Bottom navigation on mobile
- Left sidebar on desktop
- Cards with clear actions
- Human-readable status badges
- Sticky action bars
- Slide-up confirmation sheets
- Timeline calendar
- Large tap targets
- Clear warning cards

Do not expose backend labels such as:

```text
pending_admin_review
calendar_resource_collision
availability_override
```

Show:

```text
Needs review
No calendar clash
Block time
Deposit paid
Outside-zone request
```

## 11. Technical Principles

### Recommended Stack

- TypeScript
- Next.js + React
- Next.js API routes or separate Node.js service
- PostgreSQL
- Prisma or Drizzle
- Stripe
- Resend or SendGrid
- Cloudinary or Supabase Storage
- Vercel for frontend/API
- Managed PostgreSQL
- Sentry
- Plausible, PostHog, or GA4 depending on privacy preference

### Validation

- Validate on the client for UX.
- Validate on the server for security.
- Normalize postcodes before zone matching.
- Sanitize free-text customer notes and admin notes.
- Rate-limit booking and postcode validation endpoints.

### Race Condition Protection

All of these must run inside transaction-safe logic:

- Payment hold creation
- Webhook status transition
- Admin approval
- Admin decline
- Admin reschedule
- Manual booking creation
- Blocked time creation

Recommended PostgreSQL strategies:

- Calendar resource lock per business/day
- Or range types with exclusion constraints for blocking statuses

### Idempotency

Use idempotency for:

- Customer checkout/session creation
- Payment webhook handling
- Refund handling
- Admin approval
- Admin decline
- Admin reschedule
- Admin final price adjustment
- Manual payment recording where practical

### Security

- Admin login required for all `/admin` routes.
- Owner should use two-factor authentication.
- Role-based permissions are required.
- Never store card numbers or sensitive card details.
- Verify payment webhooks by provider signature.
- Use HTTPS only.
- Do not expose internal IDs in public URLs.
- Use secure random tokens for booking status and reschedule links.
- Log access and actions around payments, refunds, pricing, and approval.

### Accessibility

- Mobile-first.
- Minimum 44px tap targets.
- Keyboard accessible forms.
- Clear focus states.
- Status labels must not rely on colour alone.
- Reduced-motion support required.
- Sticky CTAs must not cover form buttons or required content.

## 12. Legal and Policy Rules

Required policy pages:

- Privacy Policy
- Terms & Conditions
- Deposit & Cancellation Policy
- Service Area Policy
- Cookie Policy if analytics or tracking requires it
- Photo / Marketing Consent Policy

The customer must be told before payment:

- A deposit is required to submit a booking request.
- The appointment is not confirmed until AUTO VALET approves it.
- Prices may vary depending on vehicle condition on arrival.
- Outside-zone requests may only be considered for the configured minimum vehicle count.
- Parking and vehicle access must be suitable.
- Weather or unsafe conditions may require rescheduling.
- Deposit rules apply.

Photo consent must be optional and recorded.

Public gallery images require consent verification, and number plates should be hidden, cropped, blurred, or avoided where possible.

## 13. Edge Cases Every Future Prompt Must Respect

- Two customers try to reserve the same slot: only one payment hold can be created.
- Customer starts checkout and abandons it: hold expires and releases the slot.
- Customer payment succeeds but webhook is delayed: show payment processing until confirmed.
- Webhook is retried: process it once.
- Payment fails: booking request is not submitted and slot is released.
- Admin tries to approve unpaid request: block approval.
- Admin tries to approve conflicting request: block approval and suggest new time.
- Admin manually adds a phone booking: public availability updates.
- Admin blocks time: public slot generation respects it.
- Outside-zone with 1 or 2 vehicles by default: block before payment.
- Outside-zone with 3 or more vehicles by default: allow paid request and flag admin.
- Multiple vehicles at same address: one travel buffer after the full visit.
- Final job of day: service must end inside working hours; buffer may extend after closing.
- Customer cancels within policy window: apply deposit rule.
- Customer no-show or vehicle inaccessible: record reason and apply policy.
- Admin declines before approval: refund or transfer deposit according to policy.
- Weather issue: reschedule and transfer deposit.
- Final price changes after inspection: record reason and audit log.
- Balance paid manually: record payment method and audit log.
- Gallery upload without consent: keep private.
- Analytics events must not include full name, address, email, phone, or payment IDs.

## 14. Do Not Violate

- Do not build instant confirmed booking.
- Do not let unpaid customer requests reach admin review.
- Do not call selected times confirmed before admin approval.
- Do not ignore payment holds in calendar blocking.
- Do not ignore pending paid requests in calendar blocking.
- Do not let expired, failed, declined, cancelled, or refunded bookings block future availability.
- Do not add one travel buffer per vehicle at the same address.
- Do not hard-code services, add-ons, durations, deposits, zones, or availability when admin settings are required.
- Do not skip server-side validation.
- Do not skip transaction-safe conflict checks.
- Do not store card details.
- Do not process webhooks without signature verification and idempotency.
- Do not perform approval, decline, refund, reschedule, manual booking, price adjustment, or payment recording without audit logging.
- Do not show backend status names to customers or beginner admin UI.
- Do not use cheap sales wording or generic car-wash visuals.
- Do not use public gallery photos without consent.

## 15. MVP Build Order

1. Core website
   - Mobile-first homepage
   - Services and pricing
   - Gallery placeholders
   - Contact and FAQ
   - Legal/policy pages

2. Booking engine
   - Step-by-step booking request form
   - Service and add-on pricing
   - Duration calculation
   - Zone validation
   - Available slot generation
   - Calendar blocking rules

3. Payments
   - Deposit calculation
   - Stripe checkout
   - Payment hold creation
   - Webhook handling
   - Payment failed and expired states

4. Admin dashboard
   - Login
   - Today dashboard
   - Requests inbox
   - Booking detail and approval checklist
   - Approve, decline, reschedule
   - Calendar timeline
   - Manual booking creation
   - Availability and service zones

5. Job operations
   - Job-day workflow
   - Final price adjustment
   - Balance payment recording
   - Customer contact actions
   - Audit logs

6. Gallery and polish
   - Gallery manager
   - Consent management
   - Before/after uploads
   - Scroll reveals
   - Performance and accessibility pass

## 16. Acceptance Criteria

The build is not complete until:

- Customer can view services, pricing, policies, and gallery placeholders.
- Customer can submit a paid booking request.
- Customer understands the booking is not confirmed until admin approval.
- Deposit payment is required before admin review.
- Payment holds block slots and expire correctly.
- Pending paid requests block availability.
- Approved bookings block availability.
- Expired, failed, declined, cancelled, and refunded bookings release availability.
- Slot generation uses 15-minute increments.
- Scheduling uses service duration, add-on duration, optional handover gap, and one 45-minute travel buffer.
- Multi-vehicle same-location bookings use one travel buffer.
- Service-zone validation works for exact postcode, outward code, district, and region.
- Outside-zone minimum vehicle rule works.
- Admin can approve, decline, reschedule, and manually create bookings.
- Admin can manage availability, service zones, services, pricing, deposits, and gallery.
- Admin can adjust final price and record balance payments.
- Admin can run job-day workflow from a phone.
- All critical admin actions create audit logs.
- Webhooks are verified and idempotent.
- Double-booking is prevented under concurrent usage.
- The public site and admin app meet mobile accessibility and reduced-motion requirements.

