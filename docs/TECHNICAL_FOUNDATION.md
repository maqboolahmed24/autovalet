# AUTO VALET Technical Foundation

This document defines the technical foundation for the AUTO VALET website, booking engine, backend, and admin system. Future implementation prompts must follow this unless a higher-priority source blueprint changes it.

## Source Files Checked

The user requested these `/mnt/data` files:

- `/mnt/data/blueprint.md`
- `/mnt/data/look_and_feel.md`
- `/mnt/data/admin_tinbin.md`
- `/mnt/data/AUTO_VALET_Blueprint_Completion_Addendum.md`
- `/mnt/data/AUTO_VALET_Master_Product_Specification.md`, if available

In this environment, `/mnt/data` does not exist. The matching repo files were read instead:

- `blueprint.md`
- `look_and_feel.md`
- `admin_tinbin.md`
- `AUTO_VALET_Blueprint_Completion_Addendum.md`
- `AUTO_VALET_Master_Implementation_Direction.md`

`AUTO_VALET_Master_Product_Specification.md` is not present in the repo at generation time.

No real external links were present in the source files. The only URL-like value found was a placeholder Stripe checkout URL in an API example.

## 1. Recommended Final Tech Stack

Use one focused stack for the MVP:

| Area | Decision |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript, strict mode |
| Rendering | React Server Components by default; client components only for interactivity |
| Styling | Token-based global CSS plus CSS Modules for component-local styles |
| Animation | Framer Motion for controlled public/admin transitions |
| Backend | Next.js Route Handlers as the API boundary |
| Database | PostgreSQL |
| Query layer | Drizzle ORM plus raw SQL migrations where PostgreSQL locking/range constraints are needed |
| Payments | Stripe first; PayPal can be added later behind the payment provider interface |
| Email | SMTP first; Microsoft 365 from GoDaddy uses authenticated SMTP behind the notification interface |
| SMS | Twilio later, behind the notification interface |
| Image storage | Cloudinary or Supabase Storage, behind a media storage adapter |
| Admin auth | Secure credentials auth with role checks and future-ready 2FA |
| Hosting | Vercel for app/API plus managed PostgreSQL |
| Monitoring | Sentry for errors; uptime/error alerts for production |
| Analytics | Plausible, PostHog, or GA4 with privacy filtering |
| Testing | Vitest, React Testing Library, Playwright, and integration tests against PostgreSQL |

### Stack Rationale

- Next.js App Router supports public marketing pages, admin pages, route handlers, SEO, loading states, error boundaries, and deployment on Vercel without a separate app shell.
- TypeScript is required because booking, payment, zone, and admin states must be explicit and safe.
- Token-based CSS keeps the premium visual system consistent and avoids noisy ad hoc styling.
- CSS Modules keep public, booking, admin, and UI components scoped without creating a flat global stylesheet.
- Framer Motion matches the blueprint's controlled premium transitions while allowing reduced-motion support.
- PostgreSQL is the right database because the booking engine needs transaction-safe conflict checks, indexes, and optional range/exclusion constraints.
- Drizzle keeps SQL close enough to the database for locking and transaction-sensitive scheduling logic. If Prisma is chosen later, raw SQL migrations must still support the same conflict-prevention guarantees.
- Stripe is the first payment provider because deposit checkout, webhooks, idempotency, refunds, and payment references are central to the booking lifecycle.

## 2. Full Folder Structure

Use this structure when the app is scaffolded. Do not collapse it into a flat project.

```text
app/
  layout.tsx
  not-found.tsx
  (public)/
    layout.tsx
    loading.tsx
    error.tsx
    page.tsx
    services/
      page.tsx
    gallery/
      page.tsx
    faq/
      page.tsx
    contact/
      page.tsx
    policies/
      page.tsx
    booking/
      page.tsx
      loading.tsx
      error.tsx
      success/
        page.tsx
      failed/
        page.tsx
      expired/
        page.tsx
      status/
        [reference]/
          page.tsx
    reschedule/
      [token]/
        page.tsx
    booking-approved/
      page.tsx
    booking-declined/
      page.tsx
  (admin)/
    admin/
      layout.tsx
      loading.tsx
      error.tsx
      page.tsx
      login/
        page.tsx
      requests/
        page.tsx
        [id]/
          page.tsx
      calendar/
        page.tsx
      customers/
        page.tsx
        [id]/
          page.tsx
      more/
        page.tsx
      availability/
        page.tsx
      service-zones/
        page.tsx
      services-pricing/
        page.tsx
      deposit-settings/
        page.tsx
      gallery/
        page.tsx
      settings/
        page.tsx
  api/
    services/
      route.ts
    addons/
      route.ts
    validate-zone/
      route.ts
    available-slots/
      route.ts
    create-payment-hold/
      route.ts
    payments/
      webhook/
        route.ts
    booking/
      [reference]/
        route.ts
    admin/
      bookings/
        route.ts
        [id]/
          route.ts
          approve/
            route.ts
          decline/
            route.ts
          reschedule/
            route.ts
          adjust-final-price/
            route.ts
          mark-balance-paid/
            route.ts
          job-status/
            route.ts
      calendar/
        route.ts
      availability/
        route.ts
      service-zones/
        route.ts
      services-pricing/
        route.ts
      deposit-settings/
        route.ts
      gallery/
        route.ts

components/
  public/
    Hero.tsx
    TrustStrip.tsx
    ServicesPreview.tsx
    WorkStory.tsx
    PricingPreview.tsx
    ServiceAreaNotice.tsx
    FinalCta.tsx
  booking/
    BookingStepper.tsx
    BookingSummary.tsx
    VehicleStep.tsx
    AddonsStep.tsx
    LocationStep.tsx
    SlotPicker.tsx
    CustomerDetailsStep.tsx
    PaymentReview.tsx
  admin/
    AdminShell.tsx
    AdminHeader.tsx
    AdminBottomNav.tsx
    SummaryCard.tsx
    BookingCard.tsx
    BookingHeroCard.tsx
    ApprovalChecklist.tsx
    DayTimeline.tsx
    WeekStrip.tsx
    ContactActions.tsx
    BookingActionBar.tsx
    SlideUpSheet.tsx
  ui/
    Button.tsx
    Badge.tsx
    Card.tsx
    EmptyState.tsx
    ErrorState.tsx
    LoadingSkeleton.tsx
    Field.tsx
    Select.tsx
    Checkbox.tsx
    Modal.tsx
  layout/
    PublicHeader.tsx
    PublicFooter.tsx
    PageShell.tsx

lib/
  booking/
    statuses.ts
    lifecycle.ts
    conflicts.ts
    holds.ts
    references.ts
  availability/
    slots.ts
    working-hours.ts
    overrides.ts
  zones/
    normalize-postcode.ts
    validate-zone.ts
  payments/
    stripe.ts
    provider.ts
    idempotency.ts
    refunds.ts
  notifications/
    email.ts
    sms.ts
    templates.ts
    dispatcher.ts
  validation/
    booking.schema.ts
    admin.schema.ts
    zone.schema.ts
    payment.schema.ts
  pricing/
    calculate-price.ts
    calculate-duration.ts
    deposits.ts
  dates/
    timezone.ts
    format.ts
    parse.ts
  auth/
    session.ts
    permissions.ts
    password.ts
    two-factor.ts
  seo/
    metadata.ts
    structured-data.ts
    sitemap.ts
  analytics/
    events.ts
    privacy.ts
  db/
    client.ts
    transactions.ts
  api/
    response.ts
    errors.ts
    route-guards.ts

styles/
  globals.css
  tokens.css
  admin.css
  motion.css

db/
  schema/
    index.ts
    bookings.ts
    customers.ts
    vehicles.ts
    services.ts
    addons.ts
    payments.ts
    zones.ts
    availability.ts
    gallery.ts
    admin-users.ts
    audit-logs.ts
    webhook-events.ts
  migrations/
  seed/
    services.ts
    addons.ts
    settings.ts

tests/
  unit/
    booking/
    pricing/
    zones/
    dates/
  integration/
    api/
    booking-engine/
    payments/
    admin/
  e2e/
    customer-booking.spec.ts
    admin-approval.spec.ts
    outside-zone.spec.ts

docs/
  TECHNICAL_FOUNDATION.md
  decisions/
  api-contracts/
  policies/

middleware.ts
next.config.ts
tsconfig.json
package.json
```

## 3. Why This Structure Supports the Blueprint

- `app/(public)` keeps the premium customer website and booking journey separate from the admin app.
- `app/(admin)` keeps private operational screens in one protected route group.
- `app/api` exposes route handlers for booking, payment, zone, and admin workflows.
- `components/public`, `components/booking`, and `components/admin` keep UI concerns separated by user journey.
- `components/ui` contains reusable primitives only. It must not contain business-specific booking logic.
- `lib/booking`, `lib/availability`, `lib/zones`, `lib/pricing`, and `lib/payments` isolate domain rules from route handlers and UI.
- `lib/db` centralizes database access and transaction helpers.
- `db/schema` and `db/migrations` keep database structure explicit and reviewable.
- `tests/unit`, `tests/integration`, and `tests/e2e` match the risk profile: booking math, zone validation, payments, admin approval, and full customer/admin journeys.
- `docs/api-contracts` gives future prompts a place to document endpoint payloads without burying contracts in UI code.

## 4. Coding Conventions

### TypeScript

- Use `strict: true`.
- Avoid `any`. Use `unknown` at boundaries, then validate.
- Keep domain types in `lib/**/types.ts` or focused files such as `lib/booking/statuses.ts`.
- Export explicit public types from each domain module.
- Do not duplicate enum unions across files. Import from the owning domain module.
- Prefer discriminated unions for state-specific payloads.
- Route handlers must validate input before calling domain services.

### Naming

- Components: `PascalCase.tsx`, for example `BookingSummary.tsx`.
- Hooks: `useSomething.ts`.
- Domain functions: `camelCase`, for example `calculateServiceDuration`.
- Route folders: lowercase kebab-case, matching URL paths.
- Status values and database enum values: lowercase snake_case.
- IDs in code: `bookingId`, `customerId`, `paymentId`.
- Public booking references: `AV-YYYY-NNNN`, for example `AV-2026-0042`.
- Environment variables: uppercase snake_case.

### Layering Rules

- UI components must not query the database directly.
- Route handlers must be thin: validate, authenticate, call a domain service, return a standard response.
- Booking, pricing, availability, zone, and payment rules live in `lib`, not in React components.
- Payment provider code is hidden behind `lib/payments/provider.ts`.
- Email/SMS providers are hidden behind `lib/notifications`.
- Admin permission checks live in `lib/auth/permissions.ts`.
- Reusable UI primitives must not import booking/admin domain modules.

### Client and Server Components

- Use Server Components by default.
- Use Client Components for stepper state, form interactions, slot selection, modals, sheets, and Framer Motion.
- Client Components can call public APIs but must not contain authoritative business logic.
- All authoritative booking, payment, zone, and conflict decisions happen server-side.

### Styling

- `styles/tokens.css` owns brand tokens.
- `styles/globals.css` owns reset, typography, base layout, and public defaults.
- `styles/admin.css` owns admin shell variables and global admin layout.
- `styles/motion.css` owns reduced-motion rules and shared transition variables.
- Component-specific styles use CSS Modules where local complexity is high.
- Do not scatter one-off colors. Use tokens.
- Do not use large status-color backgrounds. Status colors belong in badges, dots, borders, and warnings.

## 5. Type and Naming Standards

### Core Types

```ts
export type VehicleSize = "small" | "medium" | "large_4x4";

export type ServiceType = "maintenance" | "deep_clean";

export type AddonId =
  | "engine_bay_clean"
  | "windscreen_repellent"
  | "exhaust_tips_polished"
  | "leather_deep_clean"
  | "convertible_roof_treatment"
  | "excess_pet_hair_removal"
  | "liquid_decon_clay_bar";

export type BookingStatus =
  | "draft"
  | "zone_validated"
  | "payment_hold"
  | "pending_admin_review"
  | "approved"
  | "declined"
  | "reschedule_requested"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled_by_customer"
  | "cancelled_by_admin"
  | "no_show"
  | "expired"
  | "payment_failed"
  | "refunded";

export type CalendarBlockingStatus =
  | "payment_hold"
  | "pending_admin_review"
  | "approved"
  | "on_the_way"
  | "arrived"
  | "in_progress";

export type ZoneStatus =
  | "standard_zone"
  | "outside_zone_volume_exception"
  | "outside_service_area";

export type PaymentStatus =
  | "no_payment_required"
  | "payment_hold"
  | "deposit_pending"
  | "deposit_paid"
  | "balance_unpaid"
  | "partially_paid"
  | "fully_paid"
  | "refunded"
  | "partially_refunded"
  | "transferred"
  | "payment_failed";

export type PaymentRecordStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type AdminRole = "owner" | "manager" | "staff" | "read_only";

export type BookingSource =
  | "public_booking"
  | "admin_manual"
  | "phone"
  | "instagram"
  | "whatsapp"
  | "referral";

export type PaymentGateway = "stripe" | "paypal";
```

### Status Rules

Do not use `deposit_paid` as the main booking status in new code. A successful deposit webhook should move the booking to `pending_admin_review` and set `paymentStatus` to `deposit_paid`.

Do not store `outside_service_area` bookings from the public flow unless there is a clear audit reason. Public outside-zone blocked requests should fail before checkout and not create a booking request.

### Label Mapping

Technical statuses must be mapped before display:

```ts
export const adminBookingStatusLabels: Record<BookingStatus, string> = {
  draft: "Draft",
  zone_validated: "Location checked",
  payment_hold: "Payment in progress",
  pending_admin_review: "Needs review",
  approved: "Approved",
  declined: "Declined",
  reschedule_requested: "Reschedule sent",
  on_the_way: "On the way",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  cancelled_by_customer: "Cancelled",
  cancelled_by_admin: "Cancelled by AUTO VALET",
  no_show: "No-show",
  expired: "Expired",
  payment_failed: "Payment failed",
  refunded: "Refunded",
};

export const customerBookingStatusLabels: Partial<Record<BookingStatus, string>> = {
  payment_hold: "Deposit payment in progress",
  pending_admin_review: "Waiting for approval",
  approved: "Confirmed",
  declined: "Declined",
  reschedule_requested: "New time suggested",
  completed: "Completed",
  cancelled_by_customer: "Cancelled",
  cancelled_by_admin: "Cancelled by AUTO VALET",
  expired: "Expired",
  payment_failed: "Payment failed",
};
```

## 6. API Response Conventions

All JSON APIs must use a consistent envelope.

### Success Shape

```ts
export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: {
    requestId?: string;
  };
};
```

Example:

```json
{
  "success": true,
  "data": {
    "bookingReference": "AV-2026-0042"
  },
  "message": "Booking request created."
}
```

### Error Shape

```ts
export type ApiError = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    requestId?: string;
  };
};

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "SLOT_UNAVAILABLE"
  | "PAYMENT_HOLD_EXPIRED"
  | "PAYMENT_FAILED"
  | "PAYMENT_WEBHOOK_INVALID"
  | "DUPLICATE_WEBHOOK_EVENT"
  | "BOOKING_NOT_APPROVABLE"
  | "DEPOSIT_NOT_CONFIRMED"
  | "APPROVAL_CONFLICT"
  | "OUTSIDE_SERVICE_AREA"
  | "IDEMPOTENCY_CONFLICT"
  | "SERVER_ERROR";
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "This slot is no longer available.",
    "details": {
      "requestedStartAt": "2026-05-18T14:30:00+01:00"
    }
  }
}
```

### HTTP Status Mapping

| Case | HTTP Status |
|---|---:|
| Success | 200 |
| Created resource | 201 |
| Validation error | 400 |
| Auth required | 401 |
| Permission denied | 403 |
| Not found | 404 |
| Conflict, duplicate, slot unavailable | 409 |
| Rate limited | 429 |
| Server/provider error | 500 |

### Route Handler Pattern

```ts
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createPaymentHoldSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Please check the booking details.", {
      issues: parsed.error.flatten(),
    });
  }

  const result = await createPaymentHold(parsed.data);

  if (!result.success) {
    return apiError(result.code, result.message, result.details, result.httpStatus);
  }

  return apiSuccess(result.data, "Deposit checkout created.", 201);
}
```

## 7. Date, Time, and Calendar Rules

- Store timestamps in UTC.
- Display booking times in `Europe/London`.
- Use timezone-aware parsing and formatting.
- Never compare display strings for scheduling logic.
- Store `requested_start_at`, `service_ends_at`, and `blocked_until`.
- Customer-facing service time excludes travel buffer.
- Admin calendar shows travel buffer clearly.
- Slot generation uses 15-minute increments.
- Minimum notice default: 24 hours.
- Maximum booking window default: 60 days.
- Same-day bookings disabled by default.
- Service must end inside working hours.
- Travel buffer may extend after closing by default.
- Daylight saving time must be covered by tests.

```ts
export const BUSINESS_TIMEZONE = "Europe/London" as const;
export const SLOT_INTERVAL_MINUTES = 15 as const;
export const DEFAULT_TRAVEL_BUFFER_MINUTES = 45 as const;
export const DEFAULT_MINIMUM_NOTICE_HOURS = 24 as const;
export const DEFAULT_MAX_BOOKING_WINDOW_DAYS = 60 as const;
```

## 8. Money Handling Rules

- Store money as integer minor units in GBP pence.
- Do not use floating point numbers for money.
- Do not store formatted strings in the database.
- Format money only at the UI/API presentation edge.
- Stripe amounts must use minor units.
- `estimatedTotal`, `depositDue`, `depositPaid`, `finalTotal`, `balanceDue`, and `balancePaid` are all minor-unit values.

```ts
export type MoneyMinor = number;
export type CurrencyCode = "GBP";

export type Money = {
  amountMinor: MoneyMinor;
  currency: CurrencyCode;
};

export function formatMoneyGBP(amountMinor: MoneyMinor): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amountMinor / 100);
}
```

If a decimal database type is used for reporting, it must be converted at the domain boundary and tested. The application-level rule remains integer minor units.

## 9. Booking, Availability, and Payment Rules

### Booking Rule

The customer must never see a selected slot as confirmed until admin approves it.

Customer copy must say:

```text
This is a booking request. Your appointment will be confirmed once approved by AUTO VALET.
```

### Calendar Conflict Rule

```ts
export function hasOverlap(
  newStart: Date,
  newBlockedUntil: Date,
  existingStart: Date,
  existingBlockedUntil: Date,
) {
  return newStart < existingBlockedUntil && newBlockedUntil > existingStart;
}
```

### Transaction Rule

The following must be transaction-safe:

- Create payment hold
- Expire payment hold
- Payment webhook status transition
- Admin approve
- Admin decline
- Admin reschedule
- Manual booking creation
- Block time creation
- Refund or transfer deposit

### Idempotency Rule

- `create-payment-hold` requires an idempotency key.
- Stripe webhook events are stored before processing.
- `gateway_event_id` is unique.
- Admin approve/decline/reschedule actions must tolerate double-clicks and retries.
- Money-changing actions must write audit logs.

## 10. Security Standards

### Authentication

- All `/admin` routes require admin authentication.
- Owner account must support 2FA.
- Passwords must be hashed with a modern password hashing algorithm.
- Sessions must be secure, HTTP-only, same-site, and expire.
- Password reset must be email-based and tokenized.

### Authorization

Check permissions for every admin mutation:

- `approve_booking`
- `decline_booking`
- `create_manual_booking`
- `refund_payment`
- `edit_pricing`
- `edit_service_zones`
- `edit_availability`
- `manage_gallery`
- `manage_admin_users`

### Payment Security

- Never store card details.
- Verify Stripe webhook signatures.
- Use HTTPS in staging and production.
- Store provider references, statuses, and amounts only.
- Separate test and production payment keys.
- Do not test production webhooks first.

### Form and API Protection

- Rate-limit booking submissions.
- Rate-limit postcode validation.
- Rate-limit admin login.
- Use spam protection on contact forms.
- Validate and sanitize all notes/admin text fields.
- Do not expose internal IDs in public URLs.
- Use secure random tokens for status and reschedule links.

### Privacy

- Do not send PII to analytics.
- Do not include full address, phone, email, full customer name, or payment IDs in tracking events.
- Hide sensitive customer details from read-only roles if required.
- Log access to payment/refund actions.

## 11. Testing Standards

### Unit Tests

Required unit coverage:

- Maintenance durations and prices by vehicle size.
- Deep Clean durations and prices by vehicle size.
- Add-on price and duration calculations.
- Multi-vehicle duration with one travel buffer.
- Deposit calculations.
- Postcode normalization.
- Zone matching by exact postcode, outward code, district, and region.
- Outside-zone minimum vehicle rule.
- Date window checks, including DST.
- Money formatting and minor-unit conversion.

### Integration Tests

Required integration coverage:

- Payment hold creates only after conflict check.
- Payment hold blocks slot availability.
- Expired payment hold releases slot.
- Successful webhook moves booking to `pending_admin_review`.
- Duplicate webhook is ignored safely.
- Failed payment releases slot.
- Admin cannot approve unpaid request.
- Admin cannot approve conflicting request.
- Admin approval is transaction-safe.
- Manual booking blocks public slots.
- Refund/transfer creates payment record and audit log.

### E2E Tests

Required E2E flows:

- Customer completes standard paid booking request and admin approves.
- Customer outside zone with one vehicle is blocked.
- Customer outside zone with three vehicles is allowed for review.
- Two customers attempt the same slot; one payment hold wins.
- Customer payment succeeds but admin declines; refund/transfer path is available.
- Admin manually creates phone booking; public availability updates.
- Admin adjusts final price and marks balance paid.
- Admin completes job and uploads photos when consent allows.

### UI and Accessibility Tests

- Homepage works at mobile widths.
- Booking stepper supports one-handed mobile use.
- Sticky CTA does not cover form controls.
- Admin bottom nav works on mobile.
- Booking detail sticky action bar works.
- Calendar timeline remains readable.
- Reduced motion disables heavy animations.
- Forms are keyboard accessible.
- Buttons meet 44px minimum tap target.

## 12. Deployment and Environment Standards

### Environments

Use three environments:

- Local development
- Staging
- Production

Staging must be used for:

- Payment test mode
- Email template testing
- Admin approval testing
- Calendar conflict testing
- Webhook testing
- Smoke tests before production

### Environment Variables

Expected categories:

```text
DATABASE_URL
NEXT_PUBLIC_SITE_URL
ADMIN_SESSION_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM_EMAIL
SENTRY_DSN
ANALYTICS_PROVIDER_KEY
CLOUDINARY_URL or storage-provider equivalent
```

Rules:

- No secrets in source control.
- Separate staging and production secrets.
- Production payment keys only in production.
- Webhook secrets are environment-specific.

### Production Launch Requirements

- Domain connected.
- SSL active.
- Production payment keys configured.
- Webhook endpoint verified.
- Email sending domain authenticated.
- Admin owner account created.
- 2FA enabled or ready for owner.
- Database backups enabled.
- Error monitoring active.
- Uptime/error alerts active.
- Analytics configured only if privacy policy/cookie requirements are satisfied.
- Privacy, terms, deposit/cancellation, and service area policies published.

### Backups and Monitoring

- Daily database backups.
- 30-day backup retention.
- Manual backup before major releases.
- Image storage backup/versioning where supported.
- Monitor payment webhook failures.
- Monitor booking creation errors.
- Monitor admin approval errors.
- Monitor slot conflict errors.
- Monitor email delivery failures.
- Monitor application crashes and database connection errors.

## 13. SEO and Analytics Standards

SEO support must include:

- Metadata per public route.
- Sitemap.
- Robots file.
- Canonical URLs.
- Open Graph image.
- Semantic headings.
- Image alt text.
- LocalBusiness structured data.
- Service structured data.
- FAQPage structured data.
- BreadcrumbList structured data.
- ImageObject structured data for public gallery images.

Analytics events must avoid PII.

Recommended events:

- `homepage_viewed`
- `primary_cta_clicked`
- `service_card_clicked`
- `booking_started`
- `package_selected`
- `vehicle_size_selected`
- `addons_selected`
- `postcode_submitted`
- `zone_validated`
- `zone_failed`
- `slot_selected`
- `customer_details_completed`
- `deposit_checkout_started`
- `deposit_paid`
- `booking_request_created`
- `booking_request_approved`
- `booking_request_declined`
- `payment_failed`

## 14. Future Prompt Checklist

Before implementing any future feature:

- Read the blueprint source files and this technical foundation.
- Keep the paid booking request model. Never implement instant confirmed booking.
- Keep deposit-before-admin-review.
- Keep admin approval mandatory.
- Validate customer-facing forms on client and server.
- Run booking conflict checks server-side inside transaction-safe logic.
- Use 15-minute slot increments.
- Use one 45-minute travel buffer per location visit.
- Treat pending paid requests and payment holds as blocking.
- Use integer minor units for money.
- Store timestamps in UTC and display in `Europe/London`.
- Use API response envelopes consistently.
- Map technical statuses to human labels before display.
- Add loading, empty, error, success, and expired states where relevant.
- Add tests for every booking, payment, zone, calendar, and admin-action rule touched.
- Do not store card details.
- Do not expose internal IDs in public URLs.
- Write audit logs for admin approval, decline, reschedule, refund, manual booking, price adjustment, and payment recording.
