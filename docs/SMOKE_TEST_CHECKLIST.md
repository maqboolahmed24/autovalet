# Smoke Test Checklist

Run this checklist against staging and production after deployment.

## Public Website

- Open `/`.
- Open `/services`.
- Open `/gallery`.
- Open `/faq`.
- Open `/contact`.
- Open `/policies/privacy`.
- Open `/policies/terms`.
- Open `/policies/deposit-cancellation`.
- Open `/policies/cookies`.
- Confirm footer links work.
- Confirm mobile navigation opens and closes.

## SEO And Privacy

- Open `/sitemap.xml` and confirm no `/admin` or `/booking/status` URLs appear.
- Open `/robots.txt` and confirm `/admin`, `/api/admin` and `/booking/status` are disallowed.
- Open a booking status URL and confirm it is noindex.
- Confirm structured data uses no fake phone, address, rating or review.

## Booking Flow

- Start a booking from the homepage.
- Select a package.
- Enter vehicle make/model and size.
- Select add-ons.
- Enter postcode and check service area.
- Enter full address and parking/access details.
- Select vehicle count.
- Select requested date and time.
- Enter customer details.
- Reach review page.
- Confirm copy says booking request and manual approval.
- Confirm payment button fails safely if checkout is not configured.

## API Checks

- `POST /api/validate-zone` returns a standard-zone result for a known configured zone.
- `POST /api/validate-zone` blocks outside-zone requests below 3 vehicles.
- `POST /api/available-slots` returns requested slot options for a valid service/date.
- `POST /api/create-payment-hold` validates missing draft data.
- `POST /api/create-payment-hold` returns safe not-configured response when persistence/provider is unavailable.

## Admin

- `/admin/login` loads.
- `/admin` requires auth or shows auth setup state.
- `/admin/requests` requires auth or shows auth setup state.
- `/admin/calendar` requires auth or shows auth setup state.
- `/admin/customers` requires auth or shows auth setup state.
- Admin mutation APIs do not return fake success without auth/persistence.

## Payments

- Stripe checkout uses test mode in staging.
- Webhook endpoint verifies signatures.
- Payment success creates `pending_admin_review`, not `approved`.
- Failed checkout routes to `/booking/failed`.
- Expired checkout routes to `/booking/expired`.

## Notifications

- Email provider is disabled safely or sends only test emails.
- Notification failures do not block booking persistence.
- Customer templates never say confirmed unless booking status is approved.

## Gallery

- Admin upload URL route fails safely if media provider is missing.
- Public gallery placeholders still render if real media is not connected.
- Gallery items cannot be public without consent and safety checks.

## Final Checks

- `npm run build` passes.
- No secrets are committed.
- Backups are enabled before production traffic.
- Monitoring alerts are configured.
