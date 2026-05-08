# Deployment And Environment

## Local Setup

```bash
npm ci
npm run dev
```

The app runs on Next.js App Router. The current scripts are:

- Build: `npm run build`
- Dev: `npm run dev`
- Start: `npm run start`

## Required Environment Variables

Required before production launch:

```text
NEXT_PUBLIC_SITE_URL
DATABASE_URL
ADMIN_SESSION_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

## Optional Environment Variables

Optional provider variables:

```text
RESEND_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER
SENTRY_DSN
ANALYTICS_PROVIDER_KEY
CLOUDINARY_URL
```

See `.env.example` for the canonical checklist. Do not commit real secrets.

## Staging Setup

1. Create a staging deployment.
2. Use a staging PostgreSQL database.
3. Use Stripe test keys and test webhook endpoint.
4. Use a verified email test domain or keep email disabled.
5. Keep analytics disabled until cookie/consent requirements are reviewed.
6. Run the smoke test checklist after every deployment.

## Production Setup

1. Configure production environment variables.
2. Run database migrations.
3. Seed services, add-ons, service zones and availability.
4. Verify admin auth and owner 2FA.
5. Configure Stripe live webhook signature verification.
6. Configure email sender domain.
7. Configure image storage.
8. Configure backups, monitoring and alerting.
9. Confirm legal/privacy pages are final.

## Stripe Webhook Setup

Webhook endpoint:

```text
/api/payments/webhook
```

Required events:

- `checkout.session.completed`
- `payment_intent.payment_failed`
- `checkout.session.expired`

Every webhook must verify signatures and process idempotently. Payment success must move bookings to `pending_admin_review`, not `approved`.

## Email Domain Setup

Before sending real notifications:

1. Configure provider key.
2. Verify sender domain.
3. Test customer booking-request email.
4. Test admin new-request email.
5. Confirm notification failure does not block booking persistence.

## Image Storage Setup

The gallery upload foundation uses a media-provider abstraction. Configure Cloudinary, S3 or Supabase Storage before enabling uploads. Do not fake upload success.

## Database Migration Strategy

The current schema files are TypeScript descriptors. Before production:

1. Install Drizzle and PostgreSQL client.
2. Convert descriptors to real `pgTable` definitions.
3. Add raw SQL where constraints are stronger than ORM helpers.
4. Add conflict-prevention transaction/range strategy for bookings.
5. Run migrations in staging first.
6. Back up production before major migrations.

## Rollback Plan

- Keep previous deployment available.
- Keep database migrations reversible where possible.
- Back up database before release.
- Disable payment checkout if webhook or persistence errors occur.
- Keep booking request copy clear if checkout is temporarily unavailable.
