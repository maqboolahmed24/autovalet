# Testing Plan

## Current State

The repo now includes test scaffolds under `tests/`, but the test runner packages are not installed yet. `package.json` currently has `dev`, `build` and `start` only, so the scaffolds are not wired into scripts.

Install before making tests mandatory:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom playwright @playwright/test
```

Then add scripts such as:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

Remove `tests/test-runner-shims.d.ts` once real runner types are installed.

## Unit Tests

Existing scaffolds:

- `tests/unit/pricing.test.ts`
- `tests/unit/duration.test.ts`
- `tests/unit/zones.test.ts`
- `tests/unit/availability.test.ts`
- `tests/unit/slots.test.ts`
- `tests/unit/booking-lifecycle.test.ts`
- `tests/unit/deposit-policy.test.ts`

Covered launch-critical rules:

- Maintenance small no add-ons is `5500`.
- Maintenance medium with engine bay is `9500`.
- Deep Clean large with pet hair is `20000`.
- Multi-vehicle estimates multiply service and add-on values.
- Deposit does not exceed estimated total.
- `formatMoneyGBP` displays GBP pence safely.
- Duration includes add-ons and one travel buffer per location visit.
- Zone validation normalizes postcodes and applies the 3+ outside-zone rule.
- Availability respects Monday/Sunday defaults and overrides.
- Slot generation respects 15-minute increments, working hours, blocking statuses and exact boundaries.
- Lifecycle transitions block payment from approving bookings.
- Cancellation/deposit policy handles admin decline, weather, late customer cancellation and no-show eligibility.

## Integration/API Tests

Existing scaffolds:

- `tests/integration/api-validate-zone.test.ts`
- `tests/integration/api-available-slots.test.ts`
- `tests/integration/api-create-payment-hold.test.ts`

Required additions when auth/persistence is connected:

- Admin APIs return `ADMIN_AUTH_NOT_CONFIGURED`, `UNAUTHORIZED` or `FORBIDDEN` when session/permission is missing.
- Admin mutation routes return `PERSISTENCE_NOT_CONFIGURED` until database writes are real.
- Payment-hold route recalculates pricing/duration and re-checks slots against database conflicts.
- Webhook route verifies Stripe signatures and ignores duplicate events.

## E2E Tests

Existing scaffolds:

- `tests/e2e/customer-booking.spec.ts`
- `tests/e2e/admin-approval.spec.ts`
- `tests/e2e/admin-calendar.spec.ts`

Run these only after a stable local/staging environment exists. Current admin auth intentionally fails closed, so admin E2E tests should accept login/auth setup states until real sessions exist.

## Test Data

Use safe fake customer data only. Do not use real names, phone numbers, addresses, payment references or booking references in tests.

## Blocking Launch Criteria

Before production launch, CI must run:

1. Typecheck.
2. Lint.
3. Unit tests.
4. API/integration tests.
5. Playwright smoke flow.
6. Production build.
