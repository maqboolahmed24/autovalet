# AUTO VALET

Premium mobile car detailing website, public booking request flow and admin operations foundation built with Next.js App Router and TypeScript.

## Current Status

This repo is an implementation foundation, not a production-ready launch build.

Safe placeholders are intentional:

- Admin auth is not configured and fails closed.
- Database persistence is not connected.
- Deposit checkout does not fake payment success.
- Refunds, uploads, notifications and data requests do not fake provider success.
- Public booking remains request-first and approval-required.

## Setup

```bash
npm ci
npm run dev
```

## Scripts

Current scripts:

- `npm run dev`
- `npm run build`
- `npm run start`

Tests are scaffolded under `tests/`, but Vitest and Playwright are not installed yet. See `docs/TESTING_PLAN.md`.

## Environment Variables

Copy `.env.example` and provide values for the services you are enabling.

Required before production:

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `ADMIN_SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Optional providers:

- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `SENTRY_DSN`
- `ANALYTICS_PROVIDER_KEY`
- `CLOUDINARY_URL`

Do not commit real secrets.

## Important Safety Notes

- A paid deposit creates a booking request, not a confirmed appointment.
- Only admin approval may make a booking confirmed.
- Booking status pages are noindex and excluded from the sitemap.
- Admin routes must never be exposed without real auth.
- Analytics must not receive customer PII.
- Money is stored and calculated in integer GBP pence.

## Documentation

Core handover docs:

- `docs/DEVELOPER_HANDOVER.md`
- `docs/TESTING_PLAN.md`
- `docs/DEPLOYMENT_AND_ENVIRONMENT.md`
- `docs/BACKUPS_AND_MONITORING.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/SMOKE_TEST_CHECKLIST.md`

## Known Placeholders

Before launch, connect:

1. PostgreSQL/Drizzle persistence.
2. Admin authentication and permissions.
3. Stripe checkout and webhook writes.
4. Notification provider and logs.
5. Media storage provider.
6. Admin settings persistence.
7. GDPR data request handling.
8. Audit logs and monitoring.
