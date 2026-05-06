---

# AUTO VALET — Blueprint Completion Addendum

This addendum completes the original AUTO VALET blueprint by adding the operational, policy, technical, testing, and launch details required before development.

It is designed to be appended after **Section 37. Final Recommended System Logic** in the existing blueprint.

---

# 38. Final Business Rules & Locked Decisions

These rules turn the blueprint from a concept into a build-ready specification.

## 38.1 Recommended MVP Defaults

| Area | Recommended Default | Admin Configurable? |
|---|---:|---:|
| Booking model | Booking request, not instant confirmation | No |
| Manual approval | Required for every booking | No |
| Travel buffer | 45 minutes after each location visit | Yes |
| Slot interval | 15-minute increments | Yes |
| Same-day bookings | Disabled by default | Yes |
| Minimum notice | 24 hours | Yes |
| Maximum booking window | 60 days ahead | Yes |
| Outside-zone minimum | 3 vehicles at same address | Yes |
| Customer account | Guest checkout only for MVP | Later |
| Deposit | Required before admin review | Yes |
| Balance payment | Paid on completion | Yes |
| Final price adjustment | Admin can adjust after arrival | Yes |
| Photo consent | Optional checkbox during booking | Yes |

## 38.2 Service Duration Rules

The original blueprint defines vehicle-size durations. The completed system should calculate duration from:

```text
package duration by vehicle size
+
selected add-on durations
+
optional multi-vehicle handover gap
+
travel buffer after the location visit
```

The travel buffer is not part of the customer-facing service duration. It is an internal calendar block.

## 38.3 Recommended Package Durations

| Package | Small | Medium | Large / 4x4 |
|---|---:|---:|---:|
| Maintenance | 60 mins | 75 mins | 90 mins |
| Deep Clean | 150 mins | 180 mins | 210 mins |

The exact Deep Clean durations can be adjusted in admin, but the system must support different durations by package and vehicle size.

## 38.4 Recommended Add-On Durations

| Add-on | Price | Recommended Extra Duration |
|---|---:|---:|
| Engine bay clean | £30 | 20 mins |
| Windscreen repellent | £30 | 15 mins |
| Exhaust tips polished | £20 | 15 mins |
| Leather deep clean | £50 | 35 mins |
| Convertible roof treatment | £40 | 30 mins |
| Removal of excess pet hair | £30 | 45 mins |
| Liquid decon and clay bar | £50 | 60 mins |

Each add-on must store:

```text
price
extra_duration_minutes
active/inactive status
display order
```

## 38.5 Buffer Rules

| Scenario | Rule |
|---|---|
| One vehicle at one address | Add one 45-minute buffer after the job |
| Multiple vehicles at same address | Add one 45-minute buffer after the full visit, not between vehicles |
| Admin manual block | No automatic travel buffer unless selected |
| Final job of day | Service must end inside working hours; buffer may optionally extend after closing |

Recommended setting:

```text
service_must_end_inside_working_hours = true
buffer_may_extend_after_closing = true
```

## 38.6 Booking Cut-Off Rules

The system should prevent unrealistic requests.

Recommended defaults:

```text
minimum_notice_hours = 24
maximum_booking_window_days = 60
same_day_booking_enabled = false
admin_can_override_booking_window = true
```

Customer-facing message:

```text
Bookings can be requested from 24 hours ahead. For urgent requests, please contact AUTO VALET directly.
```

---

# 39. Manual / Offline Booking Flow

The admin must be able to add bookings received through phone, Instagram, WhatsApp, referrals, or returning customers.

Without this, the online calendar could show availability that has already been promised manually.

## 39.1 Admin Manual Booking Entry

Admin path:

```text
Admin Dashboard → Add Booking
```

The admin can create:

```text
Approved booking
Pending request
Manual deposit-unpaid booking
Multi-vehicle booking
Outside-zone booking
Blocked time
```

## 39.2 Manual Booking Flow

```text
Admin taps Add Booking
↓
Select or create customer
↓
Add vehicle details
↓
Select package and add-ons
↓
Enter address and postcode
↓
System validates service zone
↓
Select date and time
↓
System checks calendar conflict and travel buffer
↓
Set payment/deposit status
↓
Choose booking status: approved or pending
↓
Save booking
↓
Calendar blocks the slot
```

## 39.3 Manual Booking Pseudocode

```pseudo
function createManualBooking(data, adminId):
    validateAdminPermission(adminId, "create_booking")
    validateCustomerData(data.customer)
    validateVehicleData(data.vehicles)
    validateServiceData(data.service, data.addons)

    zoneResult = validateServiceZone(data.postcode, data.region, data.vehicleCount)

    if zoneResult.allowed == false and data.adminOverride != true:
        return error("Location is outside service area")

    duration = calculateServiceDuration(data.vehicles, data.service, data.addons)
    blockedUntil = data.startAt + duration + travelBuffer

    begin transaction

    lockScheduleForDate(data.startAt.date)

    if slotHasConflict(data.startAt, blockedUntil):
        rollback
        return error("This time conflicts with another booking or block")

    booking = createBooking({
        source: "admin_manual",
        status: data.status,
        customer: data.customer,
        vehicles: data.vehicles,
        startAt: data.startAt,
        duration: duration,
        blockedUntil: blockedUntil,
        zoneStatus: zoneResult.type,
        depositStatus: data.depositStatus,
        createdBy: adminId
    })

    writeAuditLog(adminId, "manual_booking_created", booking.id)

    commit transaction

    if data.sendCustomerMessage == true:
        notifyCustomer(booking)

    return booking
```

## 39.4 Required Manual Booking Fields

| Field | Required? |
|---|---:|
| Customer name | Yes |
| Phone | Yes |
| Email | Optional but recommended |
| Vehicle make | Yes |
| Vehicle model | Yes |
| Vehicle size | Yes |
| Package | Yes |
| Add-ons | Optional |
| Address | Yes |
| Postcode | Yes |
| Date/time | Yes |
| Deposit status | Yes |
| Admin notes | Optional |
| Notify customer | Yes/no toggle |

## 39.5 Admin Override Rules

The admin may override:

```text
Outside-zone restriction
Minimum notice period
Maximum booking window
Deposit requirement
Working hours
```

But every override must create an audit log.

---

# 40. Final Price Adjustment & Remaining Balance Flow

The public website states that prices may vary depending on the condition of the vehicle on arrival. The admin system must support this operationally.

## 40.1 Pricing States

| Field | Meaning |
|---|---|
| estimated_total | Price shown during booking |
| deposit_paid_amount | Deposit collected online or manually |
| final_total | Final amount after inspection/completion |
| balance_due | final_total minus deposit and other payments |
| balance_paid_amount | Amount paid after service |
| payment_status | Overall payment state |
| price_adjustment_reason | Reason final price changed |

## 40.2 Payment Statuses

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

## 40.3 Final Price Adjustment Flow

```text
Admin opens approved or in-progress booking
↓
Tap Adjust Final Price
↓
System shows estimated total and deposit paid
↓
Admin enters final total
↓
Admin selects reason
↓
System recalculates remaining balance
↓
Admin saves
↓
Audit log is created
```

## 40.4 Price Adjustment Reasons

```text
Vehicle condition heavier than expected
Extra pet hair
Additional service requested
Vehicle larger than selected
Customer removed an add-on
Admin goodwill discount
Other
```

## 40.5 Balance Payment Methods

Recommended MVP:

```text
Cash
Bank transfer
Card reader / in-person card
Online payment link
Other
```

Admin should be able to mark:

```text
Balance paid
Partial balance paid
Balance waived
Balance unpaid
```

## 40.6 Balance Payment Pseudocode

```pseudo
function markBalancePaid(bookingId, amount, method, adminId):
    validateAdminPermission(adminId, "manage_payments")

    booking = getBooking(bookingId)

    if booking.status not in ["approved", "in_progress", "completed"]:
        return error("Balance can only be recorded for active or completed jobs")

    createPaymentRecord({
        bookingId: booking.id,
        type: "balance_payment",
        method: method,
        amount: amount,
        recordedBy: adminId
    })

    booking.balance_paid_amount += amount
    booking.balance_due = booking.final_total - booking.deposit_paid_amount - booking.balance_paid_amount

    if booking.balance_due <= 0:
        booking.payment_status = "fully_paid"
    else:
        booking.payment_status = "partially_paid"

    writeAuditLog(adminId, "balance_payment_recorded", booking.id)

    return booking
```

---

# 41. Job-Day Workflow

After approval, the admin needs a practical workflow for running the job.

## 41.1 Job Statuses

```text
approved
on_the_way
arrived
in_progress
completed
cancelled_by_customer
cancelled_by_admin
no_show
rescheduled
```

## 41.2 Job-Day Admin Actions

| Action | Purpose |
|---|---|
| Call customer | Confirm access or arrival |
| Navigate to address | Open map app with address |
| Mark on the way | Internal tracking |
| Mark arrived | Start on-site workflow |
| Start job | Begin service timer/status |
| Adjust final price | Reflect vehicle condition |
| Mark balance paid | Record remaining payment |
| Upload photos | Save before/after results |
| Complete job | Close booking |
| Cancel/no-show | Record operational issue |

## 41.3 Recommended Job-Day Flow

```text
Approved booking appears on Today screen
↓
Admin taps booking
↓
Tap Navigate / Call customer
↓
Mark On the Way
↓
Mark Arrived
↓
Inspect vehicle
↓
Adjust final price if needed
↓
Start Job
↓
Complete service
↓
Collect remaining balance
↓
Mark balance paid
↓
Upload before/after photos if allowed
↓
Mark Completed
```

## 41.4 Completion Requirements

Before marking a job completed, the admin should be prompted to confirm:

```text
Final price confirmed
Balance payment status selected
Job notes added if needed
Photos uploaded or skipped
```

---

# 42. Cancellation, No-Show, Transfer & Weather Policy

Clear policies protect the business and reduce disputes.

## 42.1 Recommended Deposit Policy

Customer-facing wording:

```text
A deposit is required to submit a booking request. Your appointment is only confirmed once AUTO VALET approves the request. If AUTO VALET declines your request, your deposit can be refunded or transferred to another suitable date.
```

## 42.2 Recommended Cancellation Policy

| Scenario | Recommended Rule |
|---|---|
| Customer cancels more than 48 hours before appointment | Deposit may be transferred once |
| Customer cancels within 48 hours | Deposit is non-refundable |
| Customer does not attend / vehicle unavailable | Deposit is forfeited |
| Admin declines request before approval | Deposit refunded or transferred |
| Admin cancels due to operational issue | Deposit refunded or transferred |
| Weather makes service unsuitable | Booking rescheduled; deposit transferred |

## 42.3 Cancellation Reasons

```text
Customer requested cancellation
Customer unavailable
Vehicle unavailable
No safe parking/access
Weather issue
Outside service area
Admin unavailable
Payment issue
Duplicate booking
Other
```

## 42.4 No-Show Rule

Customer-facing wording:

```text
If the vehicle is unavailable, inaccessible, or the customer cannot be contacted at the appointment time, the booking may be treated as a no-show and the deposit may be forfeited.
```

## 42.5 Weather Policy

Customer-facing wording:

```text
As a mobile detailing service, appointments may need to be rescheduled due to unsafe or unsuitable weather conditions. If AUTO VALET needs to reschedule, your deposit will be transferred to a new agreed date.
```

## 42.6 Parking and Access Policy

Customer-facing wording:

```text
Please make sure the vehicle is accessible at the agreed location and that suitable parking is available nearby. If parking restrictions, private access codes, or special instructions apply, please include them in your booking notes.
```

## 42.7 Booking Form Access Questions

Add these fields to the booking form:

| Field | Type | Required? |
|---|---|---:|
| parking_available | yes/no/not sure | Yes |
| parking_notes | text | Optional |
| vehicle_access_notes | text | Optional |
| customer_available_on_arrival | yes/no | Yes |
| marketing_photo_consent | checkbox | Optional |

---

# 43. Customer Post-Payment & Booking Status Screens

The booking journey does not end at payment. The customer needs clear screens after payment and during review.

## 43.1 Required Public Screens

```text
/payment-processing
/booking-request-received
/payment-failed
/booking-expired
/booking-status/:reference
/reschedule/:token
/booking-approved
/booking-declined
```

## 43.2 Payment Processing Screen

Message:

```text
Processing your deposit payment.
Please do not close this page yet.
```

Fallback:

```text
If this takes longer than expected, we’ll still email you once the payment status is confirmed.
```

## 43.3 Booking Request Received Screen

Message:

```text
Your booking request has been received.

Your deposit has been paid and your requested slot is now waiting for review.
Your appointment is not confirmed yet. AUTO VALET will check your location, vehicle details and availability before confirming.
```

Show:

```text
Booking reference
Requested date/time
Service/package
Vehicle details
Deposit paid
Estimated balance
Customer contact details
```

## 43.4 Payment Failed Screen

Message:

```text
Your deposit payment could not be completed.

No booking request has been submitted and the slot has not been held. Please try again or choose another time.
```

CTA:

```text
Try Payment Again
Choose Another Slot
```

## 43.5 Booking Expired Screen

Message:

```text
This payment hold has expired.

For fairness, requested slots are only held for a short time during checkout. Please choose a new slot to continue.
```

## 43.6 Booking Status Page

The customer can check status by reference link.

Statuses shown to customer:

| Internal Status | Customer Label |
|---|---|
| payment_hold | Deposit payment in progress |
| pending_admin_review | Waiting for approval |
| approved | Confirmed |
| declined | Declined |
| reschedule_requested | New time suggested |
| completed | Completed |
| cancelled_by_customer | Cancelled |
| cancelled_by_admin | Cancelled by AUTO VALET |
| expired | Expired |

---

# 44. Notification Templates

All notifications should use calm, premium, clear language.

## 44.1 Customer: Booking Request Received

```text
Subject: Your AUTO VALET booking request has been received

Hi {{customer_name}},

Thanks for your booking request.

Requested time:
{{requested_date}} at {{requested_time}}

Service:
{{service_name}} — {{vehicle_size}}

Deposit paid:
£{{deposit_paid}}

Your appointment is not confirmed yet. We’ll review your location, vehicle details and availability before confirming.

Booking reference:
{{booking_reference}}

AUTO VALET
```

## 44.2 Customer: Booking Approved

```text
Subject: Your AUTO VALET booking is confirmed

Hi {{customer_name}},

Your booking has been approved and is now confirmed.

Appointment:
{{approved_date}} at {{approved_time}}

Service:
{{service_name}}

Address:
{{service_address}}

Deposit paid:
£{{deposit_paid}}

Estimated remaining balance:
£{{balance_due}}

Please make sure the vehicle is accessible and suitable parking is available nearby.

AUTO VALET
```

## 44.3 Customer: Booking Declined

```text
Subject: Your AUTO VALET booking request update

Hi {{customer_name}},

Unfortunately, we’re unable to approve your requested booking.

Reason:
{{decline_reason}}

Deposit action:
{{refund_or_transfer_message}}

You can contact us if you’d like to arrange a different date or location.

AUTO VALET
```

## 44.4 Customer: Reschedule Suggested

```text
Subject: New time suggested for your AUTO VALET booking

Hi {{customer_name}},

Your requested time is not available, but we can offer:

{{proposed_date}} at {{proposed_time}}

Please accept or decline this new time using the link below.

{{reschedule_link}}

AUTO VALET
```

## 44.5 Customer: Appointment Reminder

```text
Subject: Reminder: AUTO VALET appointment tomorrow

Hi {{customer_name}},

This is a reminder for your confirmed appointment:

{{appointment_date}} at {{appointment_time}}

Please make sure the vehicle is accessible and suitable parking is available nearby.

Estimated remaining balance:
£{{balance_due}}

AUTO VALET
```

## 44.6 Admin: New Booking Request

```text
New booking request

{{customer_name}} has paid a deposit and is waiting for review.

{{requested_date}} at {{requested_time}}
{{service_name}} — {{vehicle_size}}
{{zone_status}}
Deposit: £{{deposit_paid}}

Open admin dashboard to approve, decline or suggest a new time.
```

## 44.7 Admin: Outside-Zone Alert

```text
Outside-zone request

{{customer_name}} requested a booking outside the usual service area.

Vehicles at address: {{vehicle_count}}
Address: {{service_address}}

Review before approval.
```

---

# 45. Customer Account Decision

For MVP, customers should not need to create an account.

## 45.1 Recommended Rule

```text
Customers book as guests.
Customer history is managed internally by the admin using email and phone number matching.
```

## 45.2 Guest Booking Benefits

```text
Faster mobile booking
Less friction
No password reset issues
Better for one-off customers
Simpler MVP build
```

## 45.3 Future Customer Account Features

Can be added later:

```text
Customer login
Saved vehicles
Saved addresses
Booking history
Easy rebook
Loyalty rewards
Customer photo gallery
```

---

# 46. Admin Roles & Permissions

Even if the business starts with one admin, the system should be ready for additional staff.

## 46.1 Roles

```text
Owner
Manager
Staff
Read-only
```

## 46.2 Permission Matrix

| Action | Owner | Manager | Staff | Read-only |
|---|---:|---:|---:|---:|
| View dashboard | Yes | Yes | Yes | Yes |
| View bookings | Yes | Yes | Yes | Yes |
| Approve booking | Yes | Yes | Yes | No |
| Decline booking | Yes | Yes | Yes | No |
| Create manual booking | Yes | Yes | Yes | No |
| Edit booking details | Yes | Yes | Limited | No |
| Adjust final price | Yes | Yes | Limited | No |
| Mark balance paid | Yes | Yes | Yes | No |
| Issue refund | Yes | Yes | No | No |
| Edit services/pricing | Yes | No | No | No |
| Edit service zones | Yes | Manager optional | No | No |
| Edit availability | Yes | Yes | No | No |
| Manage gallery | Yes | Yes | Yes | No |
| Manage admin users | Yes | No | No | No |
| View audit logs | Yes | No | No | No |

## 46.3 Security Recommendation

```text
Owner account must use two-factor authentication.
Refunds and pricing changes should require Owner or Manager permission.
```

---

# 47. Gallery, Before/After Photos & Consent

The public site has gallery placeholders. The completed blueprint needs the admin workflow and consent logic.

## 47.1 Booking Form Consent Checkbox

Optional checkbox:

```text
I allow AUTO VALET to use photos of my vehicle for marketing, without showing my personal information or number plate where possible.
```

Store:

```text
marketing_photo_consent = true/false
consent_given_at
consent_source = booking_form/admin_manual
```

## 47.2 Job Photo Workflow

```text
Open booking
↓
Tap Upload Photos
↓
Select Before photos
↓
Select After photos
↓
Add title/service/vehicle type
↓
Choose whether to feature publicly
↓
If customer consent exists, allow public gallery use
↓
Save
```

## 47.3 Gallery Item Fields

| Field | Type |
|---|---|
| id | UUID |
| booking_id | UUID nullable |
| customer_id | UUID nullable |
| title | text |
| service_type | text |
| vehicle_type | text |
| before_image_urls | array |
| after_image_urls | array |
| finished_image_urls | array |
| marketing_consent_verified | boolean |
| hide_number_plate | boolean |
| is_featured | boolean |
| active | boolean |
| created_at | timestamp |

## 47.4 Public Gallery Rules

```text
Only active gallery items appear publicly.
Only consent-approved images can be marked public.
Number plates should be hidden, cropped, blurred or avoided where possible.
Images should be compressed and lazy-loaded.
```

---

# 48. Legal Pages, Privacy & GDPR

Because the site collects names, phone numbers, emails, addresses, vehicle details, notes and payments, it needs clear policy pages.

## 48.1 Required Pages

```text
Privacy Policy
Terms & Conditions
Deposit & Cancellation Policy
Service Area Policy
Cookie Policy
Photo / Marketing Consent Policy
```

## 48.2 Data Collected

```text
Full name
Phone number
Email address
Vehicle make/model/size
Service address
Postcode
Booking notes
Payment references
Admin notes
Photo consent status
Before/after photos where applicable
```

## 48.3 Data Retention Rules

Recommended defaults:

| Data Type | Retention |
|---|---:|
| Booking records | 6 years for business/accounting records |
| Payment records | 6 years |
| Customer contact details | Until deletion requested, unless needed for records |
| Marketing consent | Until withdrawn |
| Gallery photos | Until removed or consent withdrawn |
| Audit logs | 2–6 years depending on policy |
| Failed payment holds | 90 days or less |

## 48.4 Customer Data Rights

Policy should explain how customers can request:

```text
Access to their data
Correction of their data
Deletion where legally possible
Withdrawal of marketing/photo consent
```

## 48.5 Payment Data Rule

```text
AUTO VALET must not store card numbers or sensitive card details. Payment data is processed by Stripe/PayPal. The website stores only payment references, statuses and amounts.
```

## 48.6 Cookie Rule

If analytics or tracking pixels are used:

```text
Show cookie notice and allow non-essential tracking only after consent where required.
```

---

# 49. SEO, Local Search & Structured Data

The booking system will work only if customers can find the business.

## 49.1 Core SEO Pages

```text
/
/services
/booking
/gallery
/service-areas
/faqs
/contact
/mobile-car-detailing-croydon
/mobile-car-detailing-bromley
/mobile-car-detailing-beckenham
```

The actual area pages should match the admin-approved zones.

## 49.2 Homepage SEO

Suggested title:

```text
AUTO VALET | Premium Mobile Car Detailing
```

Suggested meta description:

```text
Premium mobile car detailing at your location. Request maintenance cleans, deep cleans and finishing extras with deposit-secured booking approval.
```

## 49.3 Local Area Page Template

```text
Mobile Car Detailing in {{Area}}

Premium mobile detailing at your location in {{Area}}. Choose from maintenance cleans, deep cleans and selected add-ons. All appointments are booking requests and confirmed after review.
```

## 49.4 Structured Data

Add schema for:

```text
LocalBusiness
Service
FAQPage
BreadcrumbList
ImageObject for gallery items
```

## 49.5 Technical SEO

```text
Sitemap.xml
Robots.txt
Canonical URLs
Open Graph image
Image alt text
Fast mobile performance
Compressed images
Lazy-loaded gallery
Semantic headings
```

---

# 50. Analytics & Conversion Tracking

Analytics should measure the booking journey without making the site feel intrusive.

## 50.1 Recommended Events

```text
homepage_viewed
primary_cta_clicked
service_card_clicked
booking_started
package_selected
vehicle_size_selected
addons_selected
postcode_submitted
zone_validated
zone_failed
outside_zone_exception_started
slot_selected
customer_details_completed
deposit_checkout_started
deposit_paid
booking_request_created
booking_request_approved
booking_request_declined
payment_failed
```

## 50.2 Admin Analytics

Track:

```text
pending_requests_count
approval_time_average
decline_rate
outside_zone_request_count
completed_jobs_count
estimated_revenue
deposits_collected
balance_paid
most_popular_services
most_popular_addons
```

## 50.3 Privacy Rule

Analytics should avoid storing unnecessary personal information in tracking events.

Do not send:

```text
Full address
Phone number
Email address
Full customer name
Payment IDs
```

---

# 51. Error, Loading & Empty States

A premium product must handle awkward states clearly.

## 51.1 Public Website States

| State | Message |
|---|---|
| Loading slots | Checking available request times... |
| No slots | No request times are available for this date. Please choose another day. |
| Slot taken | This time is no longer available. Please choose another slot. |
| Invalid postcode | Please check the postcode and try again. |
| Outside zone blocked | This location is outside our usual service area. We can consider 3+ vehicles at the same address. |
| Payment failed | Your payment could not be completed. No booking request has been submitted. |
| Payment processing | Your deposit is being processed. We’ll update this page shortly. |
| Booking expired | This payment hold has expired. Please choose a new slot. |
| Network error | Something went wrong. Please try again. |

## 51.2 Admin States

| State | Message |
|---|---|
| No pending requests | No requests waiting. New paid booking requests will appear here. |
| No jobs today | No jobs today. Your day is clear. |
| No service zones | Add postcode areas or region names to control where customers can book. |
| No gallery images | Gallery images can be added after completed jobs. |
| Approval conflict | This slot is no longer available. Suggest a new time instead. |
| Deposit unpaid | This booking cannot be approved until the deposit is confirmed. |
| Refund failed | The refund could not be processed. Check the payment provider dashboard. |
| Save failed | Changes could not be saved. Please try again. |

## 51.3 Loading UI Rule

Use skeleton cards instead of spinners where possible.

```text
Dashboard cards show skeleton blocks.
Booking cards show skeleton lines.
Calendar timeline shows placeholder rows.
```

---

# 52. Final Technical Stack Recommendation

The original blueprint lists options. For a focused MVP, choose one stack.

## 52.1 Recommended Stack

```text
Frontend: Next.js + React
Styling: CSS Modules, Tailwind CSS, or plain CSS variables
Animations: Framer Motion
Backend: Next.js API routes or a separate Node.js service
Database: PostgreSQL
ORM: Prisma or Drizzle
Payments: Stripe
Email: Resend or SendGrid
SMS: Twilio or optional later
Image storage: Cloudinary or Supabase Storage
Hosting: Vercel for frontend/API, managed PostgreSQL for database
Monitoring: Sentry
Analytics: Plausible, PostHog, or GA4 depending on privacy preference
```

## 52.2 Timezone Rule

Store timestamps in UTC.

Display all booking times in:

```text
Europe/London
```

The system must handle daylight saving time correctly.

## 52.3 Environment Structure

```text
Local development
Staging
Production
```

Never test payment webhooks directly on production first.

---

# 53. API Contracts

The original blueprint lists endpoints. This section defines example request and response payloads.

## 53.1 Validate Zone

```http
POST /api/validate-zone
```

Request:

```json
{
  "postcode": "CR0 1AA",
  "regionName": "Croydon",
  "vehicleCount": 1
}
```

Response — inside zone:

```json
{
  "allowed": true,
  "zoneStatus": "standard_zone",
  "message": "This location is inside the AUTO VALET service area."
}
```

Response — outside zone but eligible:

```json
{
  "allowed": true,
  "zoneStatus": "outside_zone_volume_exception",
  "message": "This area is outside the usual service area, but your vehicle count meets the minimum for review."
}
```

Response — blocked:

```json
{
  "allowed": false,
  "zoneStatus": "outside_service_area",
  "requiredVehicleCount": 3,
  "message": "This location is outside our usual service area. We can consider bookings for 3+ vehicles at the same address."
}
```

## 53.2 Available Slots

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
  "postcode": "CR0 1AA"
}
```

Response:

```json
{
  "date": "2026-05-18",
  "timezone": "Europe/London",
  "serviceDurationMinutes": 95,
  "travelBufferMinutes": 45,
  "slots": [
    {
      "startAt": "2026-05-18T09:00:00+01:00",
      "serviceEndsAt": "2026-05-18T10:35:00+01:00",
      "blockedUntil": "2026-05-18T11:20:00+01:00",
      "label": "09:00"
    },
    {
      "startAt": "2026-05-18T11:30:00+01:00",
      "serviceEndsAt": "2026-05-18T13:05:00+01:00",
      "blockedUntil": "2026-05-18T13:50:00+01:00",
      "label": "11:30"
    }
  ]
}
```

## 53.3 Create Payment Hold

```http
POST /api/create-payment-hold
```

Request:

```json
{
  "idempotencyKey": "client-generated-uuid",
  "packageId": "deep_clean",
  "vehicles": [
    {
      "make": "Range Rover",
      "model": "Evoque",
      "size": "large_4x4",
      "addons": ["leather_deep_clean", "pet_hair_removal"]
    }
  ],
  "customer": {
    "fullName": "Sarah Wilson",
    "phone": "07123456789",
    "email": "sarah@example.com"
  },
  "address": {
    "line1": "10 Example Road",
    "city": "Croydon",
    "postcode": "CR0 1AA"
  },
  "requestedStartAt": "2026-05-18T14:30:00+01:00",
  "parkingAvailable": "yes",
  "notes": "Heavy pet hair in boot.",
  "marketingPhotoConsent": true
}
```

Response:

```json
{
  "bookingReference": "AV-2026-0042",
  "status": "payment_hold",
  "holdExpiresAt": "2026-05-06T14:15:00+01:00",
  "estimatedTotal": 250,
  "depositDue": 30,
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

## 53.4 Admin Approve Booking

```http
POST /api/admin/bookings/{bookingId}/approve
```

Request:

```json
{
  "adminId": "admin_uuid",
  "sendCustomerNotification": true
}
```

Response:

```json
{
  "status": "approved",
  "approvedAt": "2026-05-06T14:24:00+01:00",
  "message": "Booking approved and confirmation sent."
}
```

## 53.5 Admin Adjust Final Price

```http
POST /api/admin/bookings/{bookingId}/adjust-final-price
```

Request:

```json
{
  "finalTotal": 285,
  "reason": "Extra pet hair and heavier interior condition than expected",
  "adminId": "admin_uuid"
}
```

Response:

```json
{
  "estimatedTotal": 250,
  "finalTotal": 285,
  "depositPaid": 30,
  "balanceDue": 255,
  "message": "Final price updated."
}
```

---

# 54. Database Constraints, Indexes & Idempotency

This section protects against duplicate bookings, duplicate payments and admin mistakes.

## 54.1 Additional Tables

### `webhook_events`

| Field | Type |
|---|---|
| id | UUID |
| gateway | stripe/paypal |
| gateway_event_id | text unique |
| event_type | text |
| payload | JSON |
| processed_at | timestamp nullable |
| created_at | timestamp |

### `admin_users`

| Field | Type |
|---|---|
| id | UUID |
| name | text |
| email | text unique |
| password_hash | text |
| role | owner/manager/staff/read_only |
| two_factor_enabled | boolean |
| active | boolean |
| created_at | timestamp |

### `booking_events`

This is the activity timeline for each booking.

| Field | Type |
|---|---|
| id | UUID |
| booking_id | UUID |
| event_type | text |
| actor_type | customer/admin/system |
| actor_id | UUID nullable |
| message | text |
| metadata | JSON |
| created_at | timestamp |

## 54.2 Booking Reference

Each booking should have a human-friendly reference.

Example:

```text
AV-2026-0042
```

Store:

```text
booking_reference unique not null
```

## 54.3 Important Indexes

```text
bookings(status)
bookings(requested_start_at)
bookings(blocked_until)
bookings(normalized_postcode)
bookings(customer_id)
bookings(booking_reference)
payments(booking_id)
payments(gateway_payment_id)
webhook_events(gateway_event_id)
service_zones(zone_type, value)
availability_overrides(date)
booking_events(booking_id, created_at)
```

## 54.4 Conflict Prevention

At minimum, conflict checks must run inside a database transaction.

Recommended PostgreSQL strategy:

```text
Use a calendar resource lock per business/day, or use PostgreSQL range types with an exclusion constraint for blocking statuses.
```

Blocking statuses:

```text
payment_hold
pending_admin_review
approved
on_the_way
arrived
in_progress
```

Non-blocking statuses:

```text
declined
expired
cancelled_by_customer
cancelled_by_admin
no_show
refunded
payment_failed
```

## 54.5 Idempotency Rules

Prevent duplicates from:

```text
Customer tapping pay twice
Network retry
Webhook retry
Admin tapping approve twice
Admin refund retry
```

Rules:

```text
Every create-payment-hold request must include an idempotency key.
Every payment webhook event must be stored before processing.
Every gateway_event_id must be processed once.
Approve/decline/reschedule actions must check current booking status before updating.
All money-changing actions must create audit logs.
```

---

# 55. Security & Privacy Hardening

## 55.1 Authentication

```text
Admin login required for all /admin routes.
Owner account should use two-factor authentication.
Session timeout should be configured.
Password reset should be secure and email-based.
```

## 55.2 Authorization

Every admin action checks permission:

```text
approve_booking
decline_booking
create_manual_booking
refund_payment
edit_pricing
edit_service_zones
edit_availability
manage_gallery
manage_admin_users
```

## 55.3 Payment Security

```text
Never store card details.
Verify payment webhooks with provider signature.
Use HTTPS only.
Use idempotency keys for checkout/payment operations.
Record payment references, not card data.
```

## 55.4 Form Protection

```text
Rate-limit booking form submissions.
Rate-limit postcode validation.
Use spam protection on contact forms.
Validate all fields server-side.
Sanitize notes and admin text fields.
```

## 55.5 Admin Data Protection

```text
Hide sensitive customer details from read-only users if required.
Log access to payment/refund actions.
Do not expose internal IDs in public URLs.
Use secure random tokens for booking status and reschedule links.
```

---

# 56. Testing Plan

## 56.1 Booking Engine Tests

```text
Small vehicle duration blocks 60 mins plus 45-min buffer.
Medium vehicle duration blocks 75 mins plus 45-min buffer.
Large vehicle duration blocks 90 mins plus 45-min buffer.
Deep Clean durations use package-specific duration table.
Add-ons increase service duration correctly.
Multi-vehicle bookings sum vehicle durations and add one travel buffer.
Slots do not show when they overlap existing approved bookings.
Slots do not show when they overlap pending paid requests.
Expired payment holds release slots.
Declined bookings release slots.
Admin blocked time prevents customer slots.
Minimum notice period is enforced.
Maximum booking window is enforced.
```

## 56.2 Zone Tests

```text
Exact postcode match passes.
Outward code match passes.
District code match passes.
Region name match passes.
Outside zone with fewer than minimum vehicles fails.
Outside zone with enough vehicles passes as volume exception.
Postcode normalization works with lowercase and spaces.
```

## 56.3 Payment Tests

```text
Payment hold created only after conflict check.
Successful webhook moves booking to pending admin review.
Failed payment does not create valid request.
Duplicate webhook is ignored safely.
Abandoned checkout expires hold.
Refund creates payment record and audit log.
Admin-declined booking can trigger refund or transfer.
```

## 56.4 Admin Tests

```text
Admin can approve valid pending booking.
Admin cannot approve unpaid booking.
Admin cannot approve conflicting booking.
Admin can decline pending booking with reason.
Admin can suggest new time.
Admin can create manual booking.
Admin manual booking checks conflicts.
Admin can adjust final price.
Admin can mark balance paid.
Admin can mark job completed.
Admin can upload gallery photos.
Permissions prevent unauthorized actions.
```

## 56.5 UI Tests

```text
Homepage works on mobile widths.
Booking journey works with one-handed mobile use.
Sticky CTA does not cover form buttons.
Admin bottom nav works on mobile.
Booking detail sticky action bar works.
Calendar timeline is readable on mobile.
Reduced motion disables heavy animations.
Forms are keyboard accessible.
Buttons meet 44px minimum touch target.
```

## 56.6 End-to-End Test Scenarios

```text
Customer completes standard booking request and admin approves.
Customer outside zone with 1 vehicle is blocked.
Customer outside zone with 3 vehicles is allowed for review.
Two customers attempt same slot; only one gets payment hold.
Customer payment succeeds but admin declines; refund/transfer flow is triggered.
Admin manually adds phone booking; public slot disappears.
Admin adjusts final price and marks balance paid after job.
Admin completes job and uploads before/after photos.
```

---

# 57. Deployment, Monitoring & Maintenance Plan

## 57.1 Environments

```text
Development
Staging
Production
```

Use staging for:

```text
Payment test mode
Email template testing
Admin approval testing
Calendar conflict testing
```

## 57.2 Production Launch Requirements

```text
Domain connected
SSL active
Production payment keys configured
Webhook endpoint verified
Email sending domain authenticated
Admin owner account created
Database backups enabled
Error monitoring active
Analytics installed if required
Privacy/cookie policy published
Terms/deposit policy published
```

## 57.3 Backups

Recommended:

```text
Daily database backups
30-day backup retention
Manual backup before major releases
Image storage backups or versioning
```

## 57.4 Monitoring

Track:

```text
Payment webhook failures
Booking creation errors
Admin approval errors
Slot conflict errors
Email delivery failures
Application crashes
Database connection errors
```

## 57.5 Maintenance Tasks

```text
Review failed payments weekly
Review abandoned payment holds
Review declined booking reasons
Update service zones as business expands
Update services/prices when needed
Replace placeholder gallery with real images
Check booking emails after launch
Test Stripe/PayPal webhooks after provider changes
```

---

# 58. Launch Checklist

## 58.1 Business Setup

```text
Final service list confirmed
Final prices confirmed
Deep Clean duration confirmed
Add-on durations confirmed
Deposit amount confirmed
Cancellation policy confirmed
Weather policy confirmed
Parking/access policy confirmed
Outside-zone vehicle minimum confirmed
Approved service zones entered
Working hours entered
Days off entered
```

## 58.2 Public Website

```text
Homepage complete
Services/pricing page complete
Booking journey complete
Gallery placeholders added
FAQ page complete
Contact page complete
Privacy policy published
Terms & conditions published
Deposit/cancellation policy published
Service area policy published
Mobile performance checked
Reduced motion checked
```

## 58.3 Booking System

```text
Service duration rules working
Add-on duration rules working
45-minute buffer working
Pending requests block calendar
Payment holds expire correctly
Manual bookings block calendar
Outside-zone rules working
Multi-vehicle rules working
Admin approval working
Admin decline working
Reschedule flow working
Final price adjustment working
Balance payment recording working
```

## 58.4 Payments & Notifications

```text
Stripe/PayPal checkout tested
Payment success webhook tested
Payment failed flow tested
Duplicate webhook tested
Refund flow tested
Customer request email tested
Customer approval email tested
Customer decline email tested
Admin new request alert tested
Reminder email tested
```

## 58.5 Admin

```text
Owner login created
2FA enabled
Dashboard works on mobile
Requests inbox works
Booking detail works
Approval checklist works
Calendar timeline works
Availability management works
Service zone management works
Manual booking works
Gallery upload works
Audit logs working
Permissions working
```

## 58.6 Technical

```text
Production environment configured
Database migrations applied
Backups enabled
Error monitoring enabled
Analytics configured
Email domain authenticated
SSL active
Sitemap generated
Robots.txt added
Staging tested
Production smoke test complete
```

---

# 59. Updated Acceptance Criteria

The project is complete only when the original acceptance criteria and the following additional criteria are met.

## 59.1 Business Operations

```text
Admin can manually add offline bookings.
Manual bookings block public availability.
Admin can adjust final price after inspection.
Admin can record remaining balance payments.
Admin can mark jobs on the way, in progress and completed.
Admin can handle no-show, cancellation and weather reschedule cases.
```

## 59.2 Policy Handling

```text
Deposit policy is visible before payment.
Cancellation policy is visible before payment.
Outside-zone rule is clearly explained.
Parking/access requirement is shown during booking.
Weather reschedule policy is included.
Customer can optionally grant marketing photo consent.
```

## 59.3 Technical Reliability

```text
Duplicate payment submissions are prevented.
Duplicate webhook events are ignored safely.
Admin approval is transaction-safe.
Slot conflict prevention works under concurrent usage.
Payment holds expire automatically.
All money-changing actions create audit logs.
```

## 59.4 Customer Experience

```text
Customer sees clear success, failed payment and expired hold screens.
Customer receives booking request confirmation after deposit payment.
Customer understands appointment is not confirmed until admin approval.
Customer receives approval, decline, reschedule and reminder notifications.
Customer can access a booking status page using a secure reference link.
```

## 59.5 Admin Experience

```text
Admin can operate the dashboard comfortably from a phone.
Admin sees pending requests as an inbox.
Admin sees approval checks before approving.
Admin can call, text or email the customer from the booking detail screen.
Admin sees approved jobs, pending requests, blocked time and travel buffers in the calendar timeline.
```

---

# 60. MVP vs Later Roadmap

## 60.1 MVP Must-Have

```text
Mobile-first public website
Services/pricing display
Gallery placeholders
Step-by-step booking request form
Service-zone validation
Vehicle/package/add-on duration calculation
45-minute travel buffer
Available slot generation
Deposit payment
Payment holds and expiry
Manual admin approval
Admin dashboard
Requests inbox
Booking detail checklist
Calendar timeline
Manual offline bookings
Final price adjustment
Balance payment recording
Email notifications
Legal/policy pages
Basic SEO
Testing and deployment setup
```

## 60.2 Strong Phase 2

```text
SMS notifications
Automated reminders
Customer booking status page enhancements
Before/after gallery uploader
Photo consent management
Local service area landing pages
Admin reports
Refund automation
Reschedule accept/decline links
Advanced analytics
```

## 60.3 Later Enhancements

```text
Customer accounts
Saved vehicles
Saved addresses
One-tap rebooking
Loyalty system
Staff scheduling
Route optimization
Google Calendar sync
Review request automation
Gift cards
Subscription maintenance plans
```

---

# 61. Final Completed Blueprint Summary

With this addendum, the AUTO VALET blueprint now covers:

```text
Premium mobile-first public website
Cinematic homepage and image-led brand feel
Booking request journey
Manual admin approval
Deposit and payment hold logic
Service-zone validation
Outside-zone volume exemptions
Vehicle/package/add-on duration rules
Travel buffers
Manual/offline admin bookings
Final price adjustments
Remaining balance collection
Cancellation/no-show/weather policies
Parking and access requirements
Customer notifications
Admin mobile-first booking management UI
Gallery and photo consent workflow
Legal/privacy/GDPR requirements
SEO and analytics plan
API payloads
Database constraints
Idempotency and webhook safety
Testing plan
Deployment and launch checklist
```

The finished product should feel premium to customers and simple for the business owner to operate from a phone.

The central product rule remains:

```text
AUTO VALET does not accept instant bookings.
AUTO VALET accepts paid booking requests, then manually approves them.
```

That rule protects the business while keeping the customer journey clear, controlled and premium.
