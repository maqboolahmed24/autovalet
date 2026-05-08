# Developer Handover

## Project Summary

AUTO VALET is a Next.js App Router application for a premium mobile car detailing business. It includes public marketing pages, a request-first booking flow, admin operations foundations, pricing/duration logic, zone validation, slot generation, payment-hold scaffolding, notification scaffolding, privacy foundations and admin management shells.

## Current Status

The app is intentionally not production-ready yet. It is safe by default:

- Public booking can collect a request draft and reach review.
- Payment checkout does not fake success when persistence/provider setup is missing.
- Admin auth is fail-closed.
- Admin mutation APIs do not fake persistence.
- Notifications, refunds, uploads and data requests return safe not-configured responses until providers/persistence exist.

## Key Domains

- Booking types and lifecycle: `lib/booking`.
- Pricing and duration: `lib/pricing`.
- Service zones: `lib/zones`.
- Availability and slots: `lib/availability`.
- Payment foundations: `lib/payments`.
- Admin domain functions: `lib/admin`.
- Notifications: `lib/notifications`.
- Analytics and privacy: `lib/analytics`, `lib/privacy`.
- SEO: `lib/seo`.

## Known Placeholders

Before launch, connect:

1. PostgreSQL and Drizzle schema/migrations.
2. Admin authentication and sessions.
3. Stripe checkout and webhook persistence.
4. Email provider and notification logs.
5. Media storage provider.
6. Admin-managed settings persistence.
7. Data request storage/notification.
8. Audit log writes.
9. Real customer/booking/gallery data queries.

## Safety Rules

- Payment does not approve bookings.
- Only `approved` can be customer-facing `Confirmed`.
- All money values use GBP minor units.
- Booking timestamps persist in UTC and display in Europe/London.
- Service must finish inside working hours.
- One travel buffer applies per location visit.
- Admin routes require permissions.
- No PII goes to analytics.
- No real secrets in source control.

## Testing

Test scaffolds exist under `tests/`. Install Vitest and Playwright before enforcing them in CI. See `docs/TESTING_PLAN.md`.

## Deployment

See:

- `docs/DEPLOYMENT_AND_ENVIRONMENT.md`
- `docs/BACKUPS_AND_MONITORING.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/SMOKE_TEST_CHECKLIST.md`

## Recommended Next Build Steps

1. Convert schema descriptors to real Drizzle tables and migrations.
2. Implement database client and transaction-safe booking persistence.
3. Implement admin auth/session storage.
4. Connect Stripe checkout and webhook writes.
5. Add CI scripts for typecheck, lint and tests.
6. Run staging smoke tests.
7. Resolve launch blockers in `docs/LAUNCH_CHECKLIST.md`.
