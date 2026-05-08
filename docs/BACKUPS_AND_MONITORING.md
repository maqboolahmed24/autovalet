# Backups And Monitoring

## Database Backups

- Run daily PostgreSQL backups.
- Keep at least 30 days of backup retention.
- Take a manual backup before major releases, schema migrations or payment changes.
- Test restore into staging before launch.

## Image Storage

- Use storage versioning or provider backups for gallery images.
- Keep consent/safety metadata in the database.
- If customer consent is withdrawn, deactivate public gallery rows and remove images from public surfaces.

## Error Monitoring

Recommended provider: Sentry or equivalent.

Track:

- API 5xx errors.
- Booking creation failures.
- Payment-hold failures.
- Webhook verification failures.
- Admin mutation failures.
- Gallery upload failures.

Do not send full customer notes, full address, payment provider IDs or raw webhook payloads to analytics/error tools.

## Uptime Monitoring

Monitor:

- Homepage.
- Booking page.
- `/api/validate-zone`.
- `/api/available-slots`.
- Stripe webhook endpoint health.
- Admin login page.

## Alerting

Production alerts should cover:

1. Payment webhook failure.
2. Booking creation error.
3. Email/SMS delivery failure.
4. Database connection failure.
5. Admin auth/session errors.
6. Slot conflict transaction errors.
7. Media upload provider errors.

## Audit Logs

Admin actions must write audit logs once persistence is connected:

- Booking approval, decline and reschedule.
- Cancellation, no-show, refund and transfer actions.
- Final price and balance changes.
- Service zone, pricing, deposit and availability settings changes.
- Gallery publish/deactivate actions.

Audit logs should retain enough detail for accountability without storing unnecessary sensitive message bodies or raw provider payloads.
