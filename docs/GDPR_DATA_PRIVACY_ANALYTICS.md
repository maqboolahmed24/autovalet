# GDPR, Data Privacy, Analytics And SEO

This foundation adds SEO helpers, privacy-safe analytics types, sitemap/robots files, booking-status noindex handling and a GDPR data request route.

## SEO Routes

Public sitemap routes:

- `/`
- `/services`
- `/gallery`
- `/booking`
- `/faq`
- `/contact`
- `/policies`
- `/policies/privacy`
- `/policies/terms`
- `/policies/deposit-cancellation`
- `/policies/cookies`
- `/policies/data-requests`

Admin routes and admin APIs must not be added to the public sitemap.

## Structured Data Rules

Structured data helpers live in `lib/seo`.

Implemented helpers:

- `createLocalBusinessJsonLd`
- `createServiceJsonLd`
- `createFaqPageJsonLd`
- `createBreadcrumbJsonLd`
- `createGalleryImageJsonLd`

Rules:

- Do not invent a business phone number.
- Do not invent a business address.
- Do not invent ratings or reviews.
- Do not publish fake opening hours.
- Use only factual fields available in the repo or environment.

## Sitemap And Robots

`app/sitemap.ts` lists public customer pages only.

`app/robots.ts` allows public pages and disallows:

- `/admin`
- `/api/admin`
- `/booking/status`

Booking status pages are private customer pages and must not be indexed.

## Booking Status Privacy

Booking status pages use `createPublicMetadata("bookingStatus")`, which applies `noindex`, `nofollow` and `nocache`.

Status pages must avoid exposing:

- Full address
- Internal booking UUID
- Payment provider IDs
- Notes
- Other private customer details

The current placeholder status page is privacy-safe and shows only a reference and unavailable state.

## Analytics Event Map

Analytics event names are defined in `lib/analytics/events.ts`.

Supported events:

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
- `admin_dashboard_viewed`
- `admin_request_opened`

The provider defaults to no-op. No analytics data is sent unless a privacy-safe provider adapter is configured and enabled.

## Forbidden Analytics Properties

Never send:

- Full name
- Email
- Phone
- Full address
- Full postcode
- Payment provider ID
- Booking internal UUID
- Booking reference
- Notes
- Vehicle registration

Allowed properties:

- Service type
- Vehicle size
- Add-on count
- Zone result category
- Status category
- Sanitized page path
- Anonymized booking flow step

`lib/analytics/privacy.ts` sanitizes booking status URLs and postcode-like strings in page paths.

## Cookie Policy

Non-essential analytics or marketing cookies must not be activated until a consent mechanism is implemented.

Current analytics is no-op by default and does not require a cookie banner.

If a provider is added later:

1. Confirm whether cookies or similar storage are used.
2. Update the cookie policy.
3. Add consent controls where required.
4. Keep PII out of event properties.

## Data Request Flow

Public form:

- `/policies/data-requests`

API:

- `POST /api/privacy/data-request`

Request types:

- `access`
- `deletion`
- `correction`
- `marketing_consent_withdrawal`

Validation:

- Full name required.
- Valid email required.
- Request type required.
- Message optional.

Current behavior:

- The API validates input.
- It returns `501 DATA_REQUEST_HANDLING_NOT_CONFIGURED` until secure request storage or notification delivery exists.
- It does not fake a successful submission.

## Data Retention Policy

`lib/privacy/data-retention.ts` defines the current policy foundation:

- Booking records: 72 months
- Abandoned drafts: 30 days
- Payment holds: 30 days
- Notification logs: 24 months
- Audit logs: 84 months
- Gallery consent records: 84 months

This prompt does not auto-delete records. Retention enforcement should be added after persistence and audit requirements are finalized.

## Future Consent Banner Requirement

Before enabling non-essential tracking:

- Add a consent banner or equivalent settings control.
- Store consent state securely.
- Load analytics only after consent if required.
- Keep essential booking/session cookies separate from analytics cookies.

## Testing Checklist

1. `/sitemap.xml` excludes admin routes.
2. `/robots.txt` disallows admin/admin API/status routes.
3. Booking status metadata is noindex.
4. LocalBusiness structured data has no fake address, phone or ratings.
5. FAQ structured data mirrors visible FAQ copy.
6. Analytics provider is no-op by default.
7. Analytics events do not include PII.
8. Data request API rejects invalid JSON.
9. Data request API does not return success when handling is not configured.
10. Privacy and cookie pages mention analytics and data request rules.
