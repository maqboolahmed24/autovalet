Below is a robust end-to-end algorithm and product blueprint for **AUTO VALET — Mobile Car Detailing Website & Booking System**.

The key design decision is this:

**The system should not behave like an instant booking calendar. It should behave like a premium “booking request” system where the customer pays a deposit, the slot is temporarily protected, and the admin manually approves or declines the request.**

---

# AUTO VALET — End-to-End Website & Booking Blueprint

## 1. Product Structure

The website should have two main systems:

### A. Public Customer Website

This is the mobile-first storefront.

Main sections:

| Page / Section | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| Home           | Premium introduction, trust, clear booking CTA                    |
| Services       | Packages, prices, vehicle sizes, add-ons                          |
| Gallery        | Before/after work, with placeholder blocks until images are ready |
| Booking        | Step-by-step booking request form                                 |
| FAQs           | Deposit, service zones, pricing variation, cancellation policy    |
| Contact        | Phone, email, service area message                                |

### B. Admin Web App

This is the private backend for the business owner.

Main sections:

| Admin Area         | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| Dashboard          | Today’s jobs, pending requests, alerts               |
| Booking Requests   | Approve, decline, reschedule, review deposit/payment |
| Calendar           | Approved jobs, pending holds, travel buffers         |
| Availability       | Working hours, blocked days, holidays                |
| Service Zones      | Manage allowed postcodes / regions                   |
| Services & Pricing | Manage packages, extras, deposit rules               |
| Gallery Manager    | Upload before/after photos later                     |
| Customers          | Customer history and vehicle notes                   |

---

# 2. Core Booking Philosophy

The booking system should follow this model:

```text
Customer does not book instantly.
Customer submits a paid booking request.
The requested slot is protected from other users.
Admin reviews the request.
Admin approves or declines.
Only approved requests become confirmed appointments.
```

This gives the business control over:

* Customer location
* Vehicle size
* Car condition
* Number of cars
* Availability
* Travel feasibility
* Deposit protection
* Manual quality control

---

# 3. Recommended Booking Journey

The booking journey should be broken into clean mobile-first steps.

## Customer Booking Flow

```text
Step 1: Select service package
Step 2: Select vehicle size
Step 3: Select add-ons
Step 4: Enter postcode / address
Step 5: Confirm number of vehicles
Step 6: Choose preferred date and time
Step 7: Enter personal details
Step 8: Review summary
Step 9: Pay deposit
Step 10: Booking request submitted
```

The customer should clearly see:

```text
This is a booking request. Your appointment will be confirmed once approved by AUTO VALET.
```

---

# 4. Vehicle Duration Rules

The system should calculate the base appointment duration from vehicle size.

| Vehicle Size |   Duration |
| ------------ | ---------: |
| Small Car    | 60 minutes |
| Medium Car   | 75 minutes |
| Large / 4x4  | 90 minutes |

The system should then add the fixed travel buffer.

| Rule                            |   Duration |
| ------------------------------- | ---------: |
| Travel buffer after appointment | 45 minutes |

So the total blocked calendar time becomes:

```text
blocked_time = service_duration + 45 minute travel buffer
```

Example:

| Vehicle     | Service Duration | Travel Buffer | Total Blocked Time |
| ----------- | ---------------: | ------------: | -----------------: |
| Small       |          60 mins |       45 mins |           105 mins |
| Medium      |          75 mins |       45 mins |           120 mins |
| Large / 4x4 |          90 mins |       45 mins |           135 mins |

---

# 5. Important Scheduling Rule

A job has two time ranges:

## A. Customer-Facing Service Time

This is what the customer sees.

Example:

```text
10:00 AM - 11:00 AM
```

## B. Internal Blocked Time

This includes the 45-minute travel buffer.

Example:

```text
10:00 AM - 11:45 AM
```

The customer should not necessarily see the travel buffer as part of their appointment. The admin calendar should show it clearly.

---

# 6. Slot Availability Algorithm

The booking engine should only show slots that do not conflict with:

* Approved bookings
* Pending booking requests
* Payment holds
* Admin-blocked time
* Days off
* Closed working hours
* Existing travel buffers

## Blocking Statuses

The following booking states should block the calendar:

```text
payment_hold
pending_admin_review
approved
in_progress
```

The following should not block the calendar:

```text
declined
cancelled
expired
payment_failed
refunded
```

---

## Slot Conflict Logic

A new booking conflicts with an existing booking if their internal blocked times overlap.

```text
new_start < existing_block_end
AND
new_block_end > existing_start
```

Where:

```text
new_block_end = requested_start + service_duration + travel_buffer
existing_block_end = existing_start + existing_service_duration + travel_buffer
```

---

## Example

Existing approved booking:

```text
Start: 10:00
Service duration: 60 mins
Travel buffer: 45 mins
Blocked until: 11:45
```

The next available booking cannot start at 11:00 or 11:30.

The next valid slot would be:

```text
11:45 or later
```

---

# 7. Slot Generation Algorithm

Use 15-minute increments for clean scheduling.

Example customer-facing slots:

```text
09:00
09:15
09:30
09:45
10:00
10:15
...
```

## Pseudocode

```pseudo
function generateAvailableSlots(date, selectedVehicleSize, selectedAddons, vehicleCount):
    workingHours = getWorkingHours(date)

    if date is adminDayOff:
        return []

    serviceDuration = calculateServiceDuration(selectedVehicleSize, selectedAddons, vehicleCount)
    travelBuffer = 45 minutes

    totalBlockedDuration = serviceDuration + travelBuffer

    candidateSlots = []

    currentTime = workingHours.start

    while currentTime + serviceDuration <= workingHours.end:
        candidateStart = currentTime
        candidateServiceEnd = candidateStart + serviceDuration
        candidateBlockEnd = candidateServiceEnd + travelBuffer

        if doesNotConflict(candidateStart, candidateBlockEnd):
            candidateSlots.add(candidateStart)

        currentTime = currentTime + 15 minutes

    return candidateSlots
```

Important detail:

```text
The service itself should finish inside working hours.
The travel buffer can either be allowed to extend beyond closing time or be required to fit inside the day.
```

Recommended admin setting:

```text
buffer_must_fit_inside_working_hours = true / false
```

For a solo mobile valeting business, I recommend:

```text
service must finish inside working hours
travel buffer may extend after the final job
```

This gives the admin more flexibility while still protecting the schedule.

---

# 8. Payment and Booking State Machine

The booking should move through clear states.

## Booking Status Flow

```text
draft
↓
zone_validated
↓
payment_hold
↓
deposit_paid
↓
pending_admin_review
↓
approved / declined
↓
completed / cancelled / refunded
```

---

## Full Booking State Table

| Status                | Meaning                              |    Blocks Calendar? |
| --------------------- | ------------------------------------ | ------------------: |
| draft                 | Customer started form                |                  No |
| zone_validated        | Address/postcode passed validation   |                  No |
| payment_hold          | Slot temporarily held during payment |                 Yes |
| deposit_paid          | Deposit received                     |                 Yes |
| pending_admin_review  | Waiting for admin approval           |                 Yes |
| approved              | Appointment confirmed                |                 Yes |
| declined              | Admin rejected request               |                  No |
| reschedule_requested  | Admin/customer needs new time        | Yes or configurable |
| completed             | Job finished                         |          Historical |
| cancelled_by_customer | Customer cancelled                   |                  No |
| cancelled_by_admin    | Business cancelled                   |                  No |
| expired               | Payment or request expired           |                  No |
| refunded              | Deposit refunded                     |                  No |

---

# 9. Deposit Payment Algorithm

The deposit should be collected before the booking request is submitted to admin.

However, the system must avoid a race condition where two customers pay for the same slot.

Use this flow:

```text
1. Customer selects a slot.
2. Backend checks availability.
3. Backend creates a short payment hold.
4. Customer is sent to Stripe / PayPal checkout.
5. Payment webhook confirms deposit.
6. Booking becomes pending admin review.
7. Admin approves or declines.
```

---

## Payment Hold Logic

When the customer clicks “Pay Deposit”:

```pseudo
function createPaymentHold(bookingData):
    validateBookingData(bookingData)

    begin database transaction

    if slotHasConflict(bookingData.startTime, bookingData.blockEnd):
        rollback
        return "Slot no longer available"

    create booking with status = payment_hold
    set hold_expires_at = now + 15 minutes

    create payment session with gateway

    commit transaction

    return paymentCheckoutUrl
```

If the customer does not complete payment:

```pseudo
function expirePaymentHolds():
    find bookings where status = payment_hold and hold_expires_at < now

    for each booking:
        status = expired
        release slot
```

When payment succeeds:

```pseudo
function handlePaymentSucceeded(webhook):
    booking = findBookingByPaymentReference(webhook.paymentId)

    begin transaction

    if booking.status != payment_hold:
        ignore or log webhook

    booking.status = pending_admin_review
    booking.deposit_paid = true
    booking.paid_at = now

    sendCustomerEmail("Booking request received")
    notifyAdmin("New booking request")

    commit transaction
```

---

# 10. Deposit Policy Recommendation

Because this is a manual approval system, the cleanest policy is:

```text
Deposit is required to submit a booking request.
If AUTO VALET approves the request, the deposit is applied to the final price.
If the customer cancels after approval, the deposit is non-refundable or transferable according to policy.
If AUTO VALET declines the request, the deposit should be refunded or transferred to a new date.
```

This is cleaner and more customer-friendly than making a deposit non-refundable before the business has accepted the job.

The website should display this clearly before payment:

```text
A deposit is required to submit your booking request. Your appointment is only confirmed once approved by AUTO VALET.
```

---

# 11. Service Zone Validation Algorithm

The system should not use live distance calculation.

Instead, the admin maintains a list of approved service zones.

Examples:

```text
Approved postcode prefixes:
SW1
SW2
SW3
CR0
BR1
SE20

Approved regional names:
Croydon
Bromley
Beckenham
Crystal Palace
```

---

## Customer Address Validation

The booking form should ask for:

```text
Postcode first
Then full address
```

The postcode should be normalized before checking.

Example:

```text
"sw1a 1aa" becomes "SW1A 1AA"
```

The system should extract:

```text
Full postcode: SW1A 1AA
Outward code: SW1A
Postcode area: SW
```

For a practical admin-managed system, matching should support:

| Match Type        | Example  |
| ----------------- | -------- |
| Exact postcode    | SW1A 1AA |
| Outward code      | SW1A     |
| Postcode district | SW1      |
| Region name       | Croydon  |

---

## Zone Validation Pseudocode

```pseudo
function validateServiceZone(postcode, regionName, vehicleCount):
    normalizedPostcode = normalizePostcode(postcode)
    outwardCode = extractOutwardCode(normalizedPostcode)
    districtCode = extractDistrictCode(normalizedPostcode)

    approvedZones = getActiveServiceZones()

    if normalizedPostcode in approvedZones.exactPostcodes:
        return { allowed: true, type: "standard_zone" }

    if outwardCode in approvedZones.outwardCodes:
        return { allowed: true, type: "standard_zone" }

    if districtCode in approvedZones.districtCodes:
        return { allowed: true, type: "standard_zone" }

    if regionName in approvedZones.regionNames:
        return { allowed: true, type: "standard_zone" }

    if vehicleCount >= adminSettings.minOutsideZoneVehicleCount:
        return { allowed: true, type: "outside_zone_volume_exception" }

    return {
        allowed: false,
        reason: "outside_service_area",
        requiredVehicleCount: adminSettings.minOutsideZoneVehicleCount
    }
```

---

# 12. Outside-Zone Volume Exemption

Requirement:

```text
If customer is outside the standard service zone, booking can proceed only if there are 3 to 4 cars.
```

This should be configurable.

Recommended setting:

```text
min_outside_zone_vehicle_count = 3
```

The admin can change it to 4 during busy periods.

---

## Outside-Zone Flow

```text
Customer enters postcode.
System checks service zones.
If postcode is outside approved zones:
    Ask how many vehicles are at the location.
If vehicle count is below minimum:
    Block booking politely.
If vehicle count meets minimum:
    Allow request but flag it for admin review.
```

Message example:

```text
This location is outside our usual service area. We can still consider the booking for 3+ vehicles at the same address.
```

For outside-zone bookings, the admin dashboard should show a visible badge:

```text
Outside-zone volume request
```

---

# 13. Multi-Vehicle Booking Algorithm

This is important for the outside-zone rule.

If a customer books 3 or 4 vehicles at the same location, the system should calculate the total visit duration.

Example:

| Vehicle     | Duration |
| ----------- | -------: |
| Small Car   |  60 mins |
| Medium Car  |  75 mins |
| Large / 4x4 |  90 mins |

For a booking with:

```text
1 small car
1 medium car
1 large car
```

The service duration is:

```text
60 + 75 + 90 = 225 minutes
```

Then add one travel buffer for the whole visit:

```text
225 + 45 = 270 minutes blocked
```

Do not add a 45-minute buffer between vehicles at the same address.

Recommended optional setting:

```text
same_location_vehicle_gap_minutes = 0 to 10
```

This can cover repositioning, moving equipment, or customer handover.

---

## Multi-Vehicle Pseudocode

```pseudo
function calculateServiceDuration(vehicles):
    total = 0

    for vehicle in vehicles:
        total = total + getDurationByVehicleSize(vehicle.size)

        for addon in vehicle.addons:
            total = total + addon.extraDurationMinutes

    if vehicles.count > 1:
        total = total + ((vehicles.count - 1) * sameLocationVehicleGapMinutes)

    return total
```

Since add-on durations are not currently specified, the system should include an `extra_duration_minutes` field for each add-on, even if it starts as `0`.

That prevents the booking engine from needing a rebuild later.

---

# 14. Pricing Algorithm

The customer should see transparent pricing, but with condition-based flexibility.

## Primary Packages

| Package                   |       Price |
| ------------------------- | ----------: |
| Deep Clean                | £160 - £170 |
| Maintenance - Small       |         £55 |
| Maintenance - Medium      |         £65 |
| Maintenance - Large / 4x4 |         £75 |

## Add-ons

| Add-on                     | Price |
| -------------------------- | ----: |
| Engine bay clean           |   £30 |
| Windscreen repellent       |   £30 |
| Exhaust tips polished      |   £20 |
| Leather deep clean         |   £50 |
| Convertible roof treatment |   £40 |
| Removal of excess pet hair |   £30 |
| Liquid decon and clay bar  |   £50 |

---

## Pricing Rules

The system should calculate:

```text
estimated_total = package_price + selected_addons
deposit_due = deposit rule
remaining_balance = estimated_total - deposit_due
```

But the UI should display:

```text
Estimated total
Final price may vary depending on vehicle condition on arrival.
```

---

## Deep Clean Pricing

Because Deep Clean is listed as:

```text
£160 - £170
```

There are two clean ways to handle it.

### Recommended Approach

Use vehicle size to determine the Deep Clean estimate:

| Vehicle Size | Deep Clean Estimate |
| ------------ | ------------------: |
| Small        |                £160 |
| Medium       |                £165 |
| Large / 4x4  |                £170 |

This allows a clean price calculation while keeping the range.

Alternative:

```text
Display “from £160” and allow admin to confirm final price manually.
```

For a premium booking flow, the first option feels smoother.

---

## Pricing Pseudocode

```pseudo
function calculatePrice(package, vehicles):
    total = 0

    for vehicle in vehicles:
        if package.type == "maintenance":
            total = total + getMaintenancePrice(vehicle.size)

        if package.type == "deep_clean":
            total = total + getDeepCleanPrice(vehicle.size)

        for addon in vehicle.addons:
            total = total + addon.price

    deposit = calculateDeposit(total, vehicles.count)

    return {
        estimatedTotal: total,
        depositDue: deposit,
        remainingBalance: total - deposit
    }
```

---

# 15. Deposit Calculation

Because no exact deposit amount was specified, build the system with configurable deposit rules.

Admin settings should support:

| Deposit Type      | Example                |
| ----------------- | ---------------------- |
| Fixed per booking | £20                    |
| Fixed per vehicle | £20 per car            |
| Percentage        | 20% of estimated total |
| Minimum deposit   | Minimum £20            |
| Maximum deposit   | Optional cap           |

Recommended formula:

```pseudo
deposit = max(
    adminSettings.minimumDeposit,
    estimatedTotal * adminSettings.depositPercentage
)
```

For multi-vehicle outside-zone bookings, a per-vehicle deposit may be better:

```pseudo
deposit = max(
    minimumDeposit,
    vehicleCount * depositPerVehicle,
    estimatedTotal * depositPercentage
)
```

---

# 16. Admin Approval Algorithm

The admin must approve every booking manually.

## Admin Review Screen Should Show

| Information              | Reason                           |
| ------------------------ | -------------------------------- |
| Customer name            | Identify customer                |
| Phone/email              | Contact customer                 |
| Address/postcode         | Check practicality               |
| Zone status              | Standard zone or outside-zone    |
| Vehicle details          | Confirm duration/price           |
| Add-ons                  | Confirm workload                 |
| Notes                    | Check condition/special requests |
| Requested time           | Approve or reject                |
| Deposit paid             | Confirm payment                  |
| Calendar conflict status | Prevent mistakes                 |

---

## Approve Booking Algorithm

Even though the slot was already blocked, the system should re-check conflicts at the exact moment of approval.

This prevents admin mistakes and race conditions.

```pseudo
function approveBooking(bookingId, adminId):
    begin database transaction

    booking = getBookingForUpdate(bookingId)

    if booking.status != pending_admin_review:
        rollback
        return "Booking cannot be approved from current status"

    if paymentIsNotConfirmed(booking):
        rollback
        return "Deposit has not been received"

    if slotHasConflictExcludingSelf(booking):
        rollback
        return "Slot conflict detected"

    booking.status = approved
    booking.approved_by = adminId
    booking.approved_at = now

    createCalendarEvent(booking)
    sendCustomerConfirmation(booking)
    sendAdminConfirmation(booking)

    commit transaction
```

---

## Decline Booking Algorithm

```pseudo
function declineBooking(bookingId, adminId, reason):
    begin database transaction

    booking = getBookingForUpdate(bookingId)

    if booking.status not in [pending_admin_review, deposit_paid]:
        rollback
        return "Booking cannot be declined from current status"

    booking.status = declined
    booking.declined_by = adminId
    booking.declined_at = now
    booking.decline_reason = reason

    releaseCalendarSlot(booking)

    if adminDeclinedBooking:
        triggerRefundOrTransferFlow(booking.deposit)

    sendCustomerDeclineMessage(booking)

    commit transaction
```

---

# 17. Rescheduling Algorithm

The admin should be able to suggest a different time.

Flow:

```text
Admin opens pending request.
Admin clicks “Suggest new time”.
System shows available slots.
Admin selects new slot.
Customer receives reschedule option.
Customer accepts or declines.
If accepted, booking remains pending or becomes approved.
```

Simpler MVP version:

```text
Admin contacts customer manually and edits requested time in dashboard.
```

Recommended robust version:

```pseudo
function proposeReschedule(bookingId, newStartTime):
    validate new slot

    booking.status = reschedule_requested
    booking.proposed_start_time = newStartTime
    booking.proposed_expires_at = now + 48 hours

    notifyCustomerWithAcceptLink()
```

---

# 18. Database Blueprint

A robust database structure should look like this.

## `customers`

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| full_name  | text      |
| phone      | text      |
| email      | text      |
| created_at | timestamp |

---

## `vehicles`

| Field      | Type                           |
| ---------- | ------------------------------ |
| id         | UUID                           |
| booking_id | UUID                           |
| make       | text                           |
| model      | text                           |
| size       | enum: small, medium, large_4x4 |
| notes      | text                           |

---

## `services`

| Field          | Type                          |
| -------------- | ----------------------------- |
| id             | UUID                          |
| name           | text                          |
| type           | enum: maintenance, deep_clean |
| base_price_min | decimal                       |
| base_price_max | decimal                       |
| active         | boolean                       |
| display_order  | integer                       |

---

## `service_variants`

Useful for size-based pricing.

| Field            | Type    |
| ---------------- | ------- |
| id               | UUID    |
| service_id       | UUID    |
| vehicle_size     | enum    |
| price            | decimal |
| duration_minutes | integer |

Example rows:

| Service     | Size        | Price |     Duration |
| ----------- | ----------- | ----: | -----------: |
| Maintenance | Small       |    55 |           60 |
| Maintenance | Medium      |    65 |           75 |
| Maintenance | Large / 4x4 |    75 |           90 |
| Deep Clean  | Small       |   160 | 60 or custom |
| Deep Clean  | Medium      |   165 | 75 or custom |
| Deep Clean  | Large / 4x4 |   170 | 90 or custom |

---

## `addons`

| Field                  | Type    |
| ---------------------- | ------- |
| id                     | UUID    |
| name                   | text    |
| price                  | decimal |
| extra_duration_minutes | integer |
| active                 | boolean |
| display_order          | integer |

Even if add-ons currently do not affect duration, keep the duration column.

---

## `bookings`

| Field                    | Type      |
| ------------------------ | --------- |
| id                       | UUID      |
| customer_id              | UUID      |
| status                   | enum      |
| package_id               | UUID      |
| requested_start_at       | timestamp |
| service_duration_minutes | integer   |
| travel_buffer_minutes    | integer   |
| blocked_until            | timestamp |
| estimated_total          | decimal   |
| deposit_due              | decimal   |
| deposit_paid             | boolean   |
| remaining_balance        | decimal   |
| full_address             | text      |
| postcode                 | text      |
| normalized_postcode      | text      |
| zone_status              | enum      |
| vehicle_count            | integer   |
| extra_notes              | text      |
| admin_notes              | text      |
| created_at               | timestamp |
| approved_at              | timestamp |
| declined_at              | timestamp |

---

## `booking_addons`

| Field               | Type          |
| ------------------- | ------------- |
| id                  | UUID          |
| booking_id          | UUID          |
| vehicle_id          | UUID nullable |
| addon_id            | UUID          |
| price_at_booking    | decimal       |
| duration_at_booking | integer       |

This allows add-ons to apply to one vehicle or multiple vehicles.

---

## `payments`

| Field              | Type                               |
| ------------------ | ---------------------------------- |
| id                 | UUID                               |
| booking_id         | UUID                               |
| gateway            | stripe / paypal                    |
| gateway_payment_id | text                               |
| amount             | decimal                            |
| currency           | GBP                                |
| status             | pending / paid / failed / refunded |
| paid_at            | timestamp                          |
| refunded_at        | timestamp                          |

---

## `service_zones`

| Field     | Type                                              |
| --------- | ------------------------------------------------- |
| id        | UUID                                              |
| zone_type | exact_postcode / outward_code / district / region |
| value     | text                                              |
| active    | boolean                                           |
| notes     | text                                              |

Example:

| Type         | Value   |
| ------------ | ------- |
| district     | SW1     |
| outward_code | SW1A    |
| region       | Croydon |

---

## `availability_rules`

| Field      | Type          |
| ---------- | ------------- |
| id         | UUID          |
| weekday    | Monday-Sunday |
| start_time | time          |
| end_time   | time          |
| active     | boolean       |

---

## `availability_overrides`

For holidays, days off, blocked slots, special hours.

| Field      | Type                                     |
| ---------- | ---------------------------------------- |
| id         | UUID                                     |
| date       | date                                     |
| start_time | time nullable                            |
| end_time   | time nullable                            |
| type       | closed_day / custom_hours / blocked_time |
| reason     | text                                     |

---

## `gallery_items`

For before/after images later.

| Field            | Type      |
| ---------------- | --------- |
| id               | UUID      |
| title            | text      |
| before_image_url | text      |
| after_image_url  | text      |
| single_image_url | text      |
| vehicle_type     | text      |
| service_type     | text      |
| display_order    | integer   |
| is_featured      | boolean   |
| active           | boolean   |
| created_at       | timestamp |

Until real images are ready, show placeholder cards.

---

## `audit_logs`

Track admin actions.

| Field       | Type                     |
| ----------- | ------------------------ |
| id          | UUID                     |
| admin_id    | UUID                     |
| action      | text                     |
| entity_type | booking / service / zone |
| entity_id   | UUID                     |
| old_value   | JSON                     |
| new_value   | JSON                     |
| created_at  | timestamp                |

---

# 19. Critical Race Condition Protection

This is one of the most important parts of the project.

Two customers must not be able to reserve the same slot at the same time.

The backend must use database-level locking.

## Recommended Rule

When creating a payment hold, approving a booking, or rescheduling:

```text
The system must perform the conflict check and booking update inside one database transaction.
```

Pseudo:

```pseudo
begin transaction

lock schedule rows for selected date

check for overlapping blocking bookings

if conflict:
    rollback
    return unavailable

create or update booking

commit
```

For a PostgreSQL database, the strongest version would use a range overlap constraint or a transaction lock on the business calendar resource.

---

# 20. Admin Dashboard Mobile-First Design

The admin dashboard should also be mobile-first because the business owner may manage jobs from their phone.

## Dashboard Home

Show cards:

```text
Today
- 09:00 Maintenance Small — Approved
- 11:45 Deep Clean Large — Approved
- 14:30 Pending Request

Pending Requests
- 3 awaiting review

This Week
- 12 approved jobs
- £X estimated revenue
- £X deposits collected
```

---

## Booking Request Card

Each pending request should appear as a compact mobile card:

```text
Pending Request
Saturday, 14:30

Deep Clean — Large / 4x4
Add-ons: Engine bay, pet hair
Address: [customer address]
Zone: Standard zone
Deposit: Paid
Estimated total: £250

[Approve] [Decline] [Suggest New Time]
```

For outside-zone bookings:

```text
Outside-zone volume request
4 vehicles at same address
```

---

## Calendar View

The admin calendar should display:

```text
Approved booking
Pending request
Payment hold
Travel buffer
Blocked time
Day off
```

A clean visual timeline is better than a dense calendar on mobile.

Recommended mobile view:

```text
Monday
09:00 - 10:00    Maintenance Small
10:00 - 10:45    Travel buffer
11:00 - 12:30    Large / 4x4
12:30 - 13:15    Travel buffer
```

---

# 21. Notification Algorithm

The system should send notifications at important stages.

## Customer Notifications

| Trigger             | Message                                    |
| ------------------- | ------------------------------------------ |
| Deposit paid        | Booking request received                   |
| Admin approved      | Appointment confirmed                      |
| Admin declined      | Request declined / refund or transfer info |
| Reschedule proposed | New time suggested                         |
| Reminder            | Appointment reminder                       |
| Cancellation        | Cancellation confirmation                  |

## Admin Notifications

| Trigger                 | Message                 |
| ----------------------- | ----------------------- |
| New paid request        | Review booking          |
| Outside-zone request    | Check location          |
| Large multi-car request | Review schedule         |
| Payment issue           | Customer payment failed |
| Upcoming job            | Reminder                |

Recommended channels:

```text
Email for all confirmations.
SMS or WhatsApp-style notification for urgent admin alerts.
```

---

# 22. Website UX Blueprint

The customer journey should feel premium, calm, and authentic.

## Tone

Avoid noisy sales wording.

Use short, confident copy.

Examples:

```text
Mobile detailing, done properly.
Premium care at your location.
Choose your service. Request your slot. We’ll confirm the booking.
```

Avoid:

```text
Best prices!!!
Book now before it’s too late!!!
Unbeatable detailing packages!!!
```

---

## Homepage Structure

Recommended order:

```text
1. Hero section
2. Trust statement
3. Service packages
4. How it works
5. Before/after gallery placeholder
6. Add-ons
7. Service area note
8. Reviews / testimonials
9. Final booking CTA
```

---

## Hero Section

Mobile-first hero:

```text
AUTO VALET

Premium mobile car detailing
at your doorstep.

Maintenance cleans, deep cleans and finishing extras, delivered with care.

[Request a Booking]
```

Under the CTA:

```text
Deposit required. All bookings are manually approved.
```

---

## Services Section

Use clean service cards.

Example:

```text
Maintenance Clean

Small — £55
Medium — £65
Large / 4x4 — £75

From 1 hour
Mobile service
Deposit required
```

Example:

```text
Deep Clean

£160 - £170

For vehicles needing a more thorough reset.
Final price may vary depending on condition on arrival.
```

---

## Gallery Placeholder

Since the real images are coming later, build this section now with placeholders.

Example layout:

```text
Recent Work

[Before / After Placeholder]
[Before / After Placeholder]
[Before / After Placeholder]

Real customer results coming soon.
```

Later, replace these with:

* Before/after slider
* Grid of completed vehicles
* Service type tags
* Vehicle type tags

Recommended image style:

```text
Rounded corners
Large mobile cards
Subtle fade-in on scroll
No cluttered overlays
```

---

# 23. Booking Form UX

The booking form should feel like a premium checkout, not a long form.

Use one step per screen on mobile.

## Step 1 — Choose Package

```text
What does your vehicle need?

[Maintenance Clean]
[Deep Clean]
```

## Step 2 — Vehicle Size

```text
Select vehicle size

[Small]
[Medium]
[Large / 4x4]
```

Add helper text:

```text
Not sure? Choose the closest size. We’ll confirm before approval.
```

## Step 3 — Add-ons

```text
Add finishing extras

[ ] Engine bay clean — £30
[ ] Windscreen repellent — £30
[ ] Exhaust tips polished — £20
[ ] Leather deep clean — £50
[ ] Convertible roof treatment — £40
[ ] Excess pet hair removal — £30
[ ] Liquid decon and clay bar — £50
```

## Step 4 — Location

```text
Where will the vehicle be?

Postcode
Full address
```

The postcode should validate before the customer reaches payment.

## Step 5 — Number of Vehicles

```text
How many vehicles are at this location?

[1] [2] [3] [4+]
```

If outside standard service zone:

```text
This area is outside our usual zone. We can consider bookings for 3+ vehicles at the same location.
```

## Step 6 — Date and Time

Show only available request slots.

```text
Choose a preferred time

Saturday 18 May
[09:00] [11:45] [14:15]
```

Use the phrase:

```text
Requested time
```

not:

```text
Confirmed time
```

## Step 7 — Customer Details

Mandatory fields:

```text
Full name
Phone number
Email address
Vehicle make
Vehicle model
Extra notes
```

## Step 8 — Review

Show a clean summary:

```text
Maintenance Clean — Medium
Add-ons: Engine bay clean
Location: Customer address
Requested time: Saturday 18 May, 11:45
Estimated total: £95
Deposit due today: £X
Remaining balance: £Y

Prices may vary depending on the condition of the car on arrival.
```

CTA:

```text
Pay Deposit & Request Booking
```

---

# 24. Premium Animation and Interaction Blueprint

The site should feel refined, not flashy.

Use subtle animations:

| Area           | Animation                    |
| -------------- | ---------------------------- |
| Page load      | Soft fade-in                 |
| Service cards  | Gentle rise on scroll        |
| Booking steps  | Smooth slide transition      |
| Buttons        | Slight press/tap feedback    |
| Gallery        | Fade-in image reveal         |
| Sticky CTA     | Appears after hero section   |
| Admin calendar | Smooth expand/collapse cards |

Important rules:

```text
Animations should be fast.
Animations should never delay booking.
Animations should respect reduced-motion accessibility settings.
```

Recommended timings:

```text
Fade/slide: 200–350ms
Button feedback: 100–150ms
Scroll reveal: once only, not repeated aggressively
```

Avoid:

```text
Heavy parallax
Overly bouncy effects
Too many moving elements
Auto-playing distracting animations
```

---

# 25. Mobile-First UI Rules

Design for mobile first, then expand to desktop.

## Mobile Rules

```text
Minimum button height: 44px
Sticky bottom booking CTA
One booking decision per screen
Large selectable cards
Clear price summary
No tiny calendar controls
No long paragraphs during checkout
Fast image loading
```

## Desktop Rules

On desktop, use more space but keep the same calm flow.

Example:

```text
Left side: booking steps
Right side: sticky booking summary
```

---

# 26. Validation Rules

## Mandatory Customer Fields

| Field               |                        Required |
| ------------------- | ------------------------------: |
| Full name           |                             Yes |
| Phone number        |                             Yes |
| Email address       |                             Yes |
| Vehicle make        |                             Yes |
| Vehicle model       |                             Yes |
| Vehicle size        |                             Yes |
| Full address        |                             Yes |
| Postcode            |                             Yes |
| Package             |                             Yes |
| Requested date/time |                             Yes |
| Deposit payment     |                             Yes |
| Extra notes         | Optional, but shown prominently |

---

## Validation Logic

```pseudo
function validateBookingRequest(data):
    require data.fullName
    require validPhone(data.phone)
    require validEmail(data.email)
    require data.vehicleMake
    require data.vehicleModel
    require data.vehicleSize
    require data.address
    require validPostcode(data.postcode)
    require data.packageId
    require data.requestedStartTime

    zoneResult = validateServiceZone(data.postcode, data.region, data.vehicleCount)

    if zoneResult.allowed == false:
        return error(zoneResult.reason)

    if selectedSlotUnavailable:
        return error("Selected time is no longer available")

    return success
```

---

# 27. Error Handling

The system should fail safely and politely.

## Common Cases

| Situation                              | System Response                                           |
| -------------------------------------- | --------------------------------------------------------- |
| Slot taken during checkout             | Release payment hold, ask customer to choose another time |
| Payment failed                         | Booking not submitted                                     |
| Payment succeeds but webhook delayed   | Show “payment processing” until confirmed                 |
| Admin declines                         | Release slot, trigger refund/transfer process             |
| Customer outside zone with 1 car       | Block booking before payment                              |
| Customer submits invalid postcode      | Ask for correction                                        |
| Admin tries approving conflicting slot | Block approval and show conflict                          |
| Customer abandons checkout             | Expire hold automatically                                 |

---

# 28. Security and Business Protection

The system should include:

```text
HTTPS everywhere
Admin login with strong password
Two-factor authentication for admin
No card details stored on website
Payment handled by Stripe/PayPal
Webhook verification
Rate limiting on forms
Spam protection
Audit logs for admin actions
Database backups
Role-based admin permissions
```

Because customer addresses, phone numbers and emails are collected, the website should also include:

```text
Privacy policy
Cookie policy if tracking is used
Clear deposit/cancellation policy
Data deletion/export process
```

---

# 29. Recommended Backend Architecture

A clean architecture would look like this:

```text
Frontend Website
    ↓
Booking API
    ↓
Database
    ↓
Payment Gateway
    ↓
Webhook Handler
    ↓
Notification Service
    ↓
Admin Dashboard
```

## Suggested Stack

A strong modern setup:

```text
Frontend: Next.js / React
Backend: Next.js API routes, Node.js, Laravel, Django, or similar
Database: PostgreSQL
Payments: Stripe
Emails: Resend, SendGrid, Mailgun, or similar
SMS: Twilio or similar
Image Storage: Cloudinary, S3, Supabase Storage, or similar
Admin Auth: Secure password login + 2FA
```

The exact stack can vary, but the architecture should remain the same.

---

# 30. API Endpoint Blueprint

## Public Booking APIs

```text
GET    /api/services
GET    /api/addons
POST   /api/validate-zone
POST   /api/available-slots
POST   /api/create-payment-hold
POST   /api/payment/webhook
GET    /api/booking/:reference
```

## Admin APIs

```text
GET    /api/admin/bookings
GET    /api/admin/bookings/:id
POST   /api/admin/bookings/:id/approve
POST   /api/admin/bookings/:id/decline
POST   /api/admin/bookings/:id/reschedule
GET    /api/admin/calendar
POST   /api/admin/availability
POST   /api/admin/service-zones
POST   /api/admin/gallery
```

---

# 31. Full Booking Algorithm

This is the complete end-to-end algorithm.

```pseudo
START

Customer opens website

Customer selects:
    package
    vehicle size
    add-ons
    number of vehicles

System calculates:
    service duration
    estimated price
    deposit amount

Customer enters:
    postcode
    full address

System validates postcode:
    if inside approved zone:
        continue
    else if outside zone and vehicle count >= minimum:
        continue as outside-zone volume request
    else:
        block booking and show message

Customer selects date

System generates slots:
    get working hours
    remove days off
    check existing bookings
    check pending requests
    check payment holds
    include 45-minute travel buffer
    return valid slots

Customer selects requested time

Customer enters:
    full name
    phone
    email
    vehicle make/model
    notes

System validates all required data

Customer clicks Pay Deposit

Backend starts transaction:
    re-check slot availability
    create payment_hold booking
    create payment checkout session
    commit transaction

Customer pays deposit

Payment gateway sends webhook

Backend verifies webhook:
    if payment successful:
        booking status = pending_admin_review
        slot remains blocked
        notify customer
        notify admin
    else:
        booking status = payment_failed
        release slot

Admin reviews request:
    check address
    check vehicle
    check notes
    check timing
    check zone status
    check deposit

Admin chooses:
    approve
    decline
    suggest new time

If approved:
    re-check conflicts
    status = approved
    send confirmation
    keep calendar blocked

If declined:
    status = declined
    release slot
    refund or transfer deposit according to policy
    notify customer

If rescheduled:
    propose new time
    customer accepts or declines
    update booking accordingly

Job day arrives

Admin marks:
    in_progress
    completed

END
```

---

# 32. Admin Calendar Blocking Example

Suppose working hours are:

```text
09:00 - 17:00
```

Existing bookings:

```text
09:00 Small Maintenance
Service: 09:00 - 10:00
Buffer: 10:00 - 10:45

11:00 Large / 4x4
Service: 11:00 - 12:30
Buffer: 12:30 - 13:15
```

Available next slots may start from:

```text
13:15 onward
```

A medium car at 13:15:

```text
Service: 13:15 - 14:30
Buffer: 14:30 - 15:15
```

Still leaves time for another small car:

```text
15:15 - 16:15
Buffer: 16:15 - 17:00
```

---

# 33. Content Blueprint

The website should use simple, premium wording.

## Homepage Copy Example

```text
AUTO VALET

Premium mobile car detailing,
wherever your car is parked.

Maintenance cleans, deep cleans and selected finishing extras carried out with care and attention.

[Request a Booking]
```

## How It Works

```text
1. Choose your service
Select your package, vehicle size and any extras.

2. Request your slot
Pick a preferred date and time.

3. Pay your deposit
Your request is sent for approval.

4. We confirm
Once approved, your appointment is confirmed.
```

## Pricing Disclaimer

```text
Prices may vary depending on the condition of the vehicle on arrival.
```

## Deposit Disclaimer

```text
A deposit is required to submit a booking request. Your appointment is confirmed only after approval.
```

---

# 34. Gallery Integration Plan

Since the images are not ready yet, build the section with future-ready structure.

## Current Placeholder Version

```text
Recent Work

[Before / After Placeholder]
[Interior Detail Placeholder]
[Exterior Finish Placeholder]
```

Use simple blocks with labels:

```text
Before
After
Coming soon
```

## Final Version

When images arrive, support:

```text
Before/after slider
Single finished vehicle images
Service category tags
Featured gallery items
Admin upload dashboard
Lazy-loaded optimized images
```

Gallery item example:

```text
Title: Interior deep clean
Vehicle: BMW 3 Series
Service: Deep Clean
Before image
After image
Featured: Yes
```

---

# 35. MVP Build Order

Build in this order to reduce risk.

## Phase 1 — Core Website

```text
Mobile-first homepage
Services/pricing page
Static gallery placeholders
Basic contact section
Premium UI styling
```

## Phase 2 — Booking Engine

```text
Step-by-step booking form
Vehicle size duration logic
Add-on selection
Price calculation
Postcode zone validation
Available slot generation
45-minute travel buffer
```

## Phase 3 — Payments

```text
Deposit calculation
Stripe/PayPal checkout
Payment hold
Payment success webhook
Payment failed flow
Expired payment holds
```

## Phase 4 — Admin Dashboard

```text
Admin login
Pending request list
Booking detail view
Approve/decline actions
Calendar timeline
Availability management
Service zone management
```

## Phase 5 — Notifications

```text
Customer booking request email
Admin new request alert
Approval email
Decline email
Reminder email/SMS
```

## Phase 6 — Gallery and Polish

```text
Before/after image uploader
Image optimization
Scroll animations
Testimonials
Final premium content pass
```

---

# 36. Acceptance Criteria

The project is complete when the following are true.

## Customer Website

```text
Customer can view services and prices.
Customer can select package, vehicle size and add-ons.
Customer can enter address and postcode.
System validates postcode against admin zones.
Outside-zone customers are blocked unless vehicle count meets minimum.
Customer can select only valid available slots.
Customer can pay a deposit.
Customer receives booking request confirmation.
Website works smoothly on mobile.
```

## Booking Engine

```text
Small car blocks 1 hour plus 45-minute buffer.
Medium car blocks 1 hour 15 minutes plus 45-minute buffer.
Large / 4x4 blocks 1 hour 30 minutes plus 45-minute buffer.
Pending requests block the calendar.
Approved bookings block the calendar.
Expired or declined requests do not block the calendar.
Double-booking is impossible under concurrent usage.
```

## Admin Dashboard

```text
Admin can manage working hours.
Admin can block days off.
Admin can manage service zones.
Admin can review pending requests.
Admin can approve bookings.
Admin can decline bookings.
Admin can see approved, pending and buffer times in calendar.
Admin can upload gallery images later.
```

## Payment

```text
Deposit is required before request reaches admin.
Payment webhook confirms deposit.
Failed payment does not create a valid request.
Abandoned checkout expires and releases slot.
Admin-declined bookings trigger refund/transfer flow.
```

---

# 37. Final Recommended System Logic

The most robust logic for AUTO VALET is:

```text
Use fixed vehicle-size durations.
Add one 45-minute travel buffer after each appointment.
Treat pending paid requests as calendar-blocking.
Use payment holds during checkout.
Use admin-managed postcode zones instead of map radius.
Allow outside-zone requests only for configured minimum vehicle count.
Require manual admin approval before final confirmation.
Use database transactions to prevent double-booking.
Keep all pricing and duration rules configurable in the admin dashboard.
Build the gallery with placeholders now and real before/after uploads later.
Design everything mobile-first with premium, minimal wording and subtle motion.
```

This gives AUTO VALET a booking system that protects the business, feels premium to customers, and remains flexible as the service grows.
