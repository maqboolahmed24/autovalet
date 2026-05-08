# Error, Loading And Empty States

## Purpose

AUTO VALET needs calm, clear states for public customers and admin users. Error states must not expose stack traces, provider errors, raw enum values or private data.

## Reusable Components

Shared components live in `components/ui`:

- `LoadingSkeleton`
- `ErrorState`
- `EmptyState`
- `UnavailableState`
- `RetryButton`

They use existing design tokens, dark premium styling and mobile-first tap targets.

## Route-Level States

Public routes:

- `app/(public)/loading.tsx`
- `app/(public)/error.tsx`
- `app/(public)/not-found.tsx`

Admin routes:

- `app/(admin)/admin/loading.tsx`
- `app/(admin)/admin/error.tsx`
- `app/(admin)/admin/not-found.tsx`

Public loading text:

```text
Preparing AUTO VALET...
```

Public error text:

```text
Something went wrong.
Please refresh the page or return to the homepage.
```

## Booking Error States

Customer-facing booking flows must handle:

- Slot unavailable: ask customer to choose another requested time.
- Zone blocked: explain 3+ outside-zone review rule without promising approval.
- Payment provider not configured: say deposit checkout is not connected yet.
- Payment failed: no booking request has been submitted.
- Hold expired: requested slot has been released.
- Network error: retry or return to booking.

## Admin Error States

Admin screens must handle:

- Auth not configured.
- Permission denied.
- Persistence not configured.
- Booking not found.
- Action unavailable for current status.
- Payment provider not configured.
- Upload provider not configured.

## Copy Rules

- Use human labels, not raw statuses.
- Do not mention implementation details to customers.
- Do not claim a booking is confirmed unless status is `approved`.
- Do not fake provider or persistence success.
- Keep actions obvious: retry, go home, go back to Today, choose another time.

## Future Work

- Add component tests once React Testing Library is installed.
- Add route-specific error boundaries for booking/payment/admin detail pages.
- Add Sentry user-safe error reporting once `SENTRY_DSN` is configured.
