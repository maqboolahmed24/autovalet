# Launch Checklist

## Brand And Content

- Public copy reviewed.
- Services and add-ons verified.
- Gallery images have consent and safety checks.
- FAQ answers match current business policy.

## Public Pages

- Homepage, services, gallery, FAQ, contact and policies load.
- Footer links work.
- Public pages are mobile-first and accessible.

## Booking Flow

- Customer can complete all booking steps.
- Zone checks work.
- Slot generation returns valid requested times.
- Review page says booking request, not confirmed appointment.
- Deposit/manual approval copy is visible.

## Admin Flow

- Admin auth configured.
- Owner account created.
- Permissions verified.
- Requests inbox works.
- Booking detail checklist works.
- Approval, decline and reschedule workflows persist and audit changes.

## Payment

- Stripe keys configured.
- Webhook signature verification configured.
- Checkout creates payment holds.
- Payment success creates `pending_admin_review`, not `approved`.
- Failed/expired checkout releases holds.

## Email/SMS

- Email sender domain verified.
- Booking request email tested.
- Admin new-request email tested.
- SMS remains disabled unless Twilio and consent rules are ready.

## Legal And Privacy

- Privacy policy complete.
- Terms complete.
- Deposit/cancellation policy complete.
- Cookie policy complete.
- Data request handling configured or launch blocker recorded.

## SEO

- Sitemap excludes admin and booking status pages.
- Robots disallows admin, admin API and booking status.
- Structured data has no fake address, phone, ratings or reviews.
- Booking status pages are noindex.

## Analytics And Cookies

- Analytics provider remains no-op or consent-safe.
- No PII sent to analytics.
- Consent banner added before non-essential cookies are enabled.

## Security

- No real secrets in repo.
- Admin routes protected.
- Admin mutations require permissions.
- Password hashing and secure sessions configured.
- Owner 2FA ready.
- Webhooks verified.

## Database And Backups

- PostgreSQL configured.
- Migrations applied.
- Service zones seeded.
- Availability seeded.
- Daily backups enabled.
- Restore tested in staging.

## Performance

- Production build passes.
- Public pages load quickly on mobile.
- Images optimized.
- API routes avoid unnecessary provider calls.

## Accessibility

- Keyboard navigation works.
- Focus states visible.
- Buttons have readable names.
- Forms have visible labels.
- Error messages are clear.

## Final Smoke Test

Run `docs/SMOKE_TEST_CHECKLIST.md` in staging before production release.

## Launch Blockers

- Payment provider not configured.
- Admin auth not configured.
- Database persistence not configured.
- Privacy/legal pages missing.
- Deposit policy unclear.
- Booking status pages indexed.
- No backup plan.
- No webhook verification.
- No service zones configured.
