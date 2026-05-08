# AUTO VALET Booking State Machine

This document defines the central booking lifecycle. No route handler, webhook, admin action, or UI should set `booking.status` directly without validating the transition through `lib/booking/lifecycle.ts`.

## Status List

| Status | Meaning |
| --- | --- |
| `draft` | Customer has started a request but it is not ready for payment. |
| `zone_validated` | Location/service-area checks have passed or are ready for checkout validation. |
| `payment_hold` | A short checkout hold protects the requested slot while deposit payment is in progress. |
| `pending_admin_review` | Deposit has been paid and AUTO VALET must manually review the request. |
| `approved` | Admin has approved the request. This is the only customer-facing confirmed state. |
| `declined` | Admin has declined the request. |
| `reschedule_requested` | Admin has suggested a new time or a reschedule is waiting for customer/admin handling. |
| `on_the_way` | Admin job-day workflow has started travel. |
| `arrived` | Admin has arrived for the job. |
| `in_progress` | Service is underway. |
| `completed` | Job is complete. |
| `cancelled_by_customer` | Customer cancelled after request/approval according to policy. |
| `cancelled_by_admin` | AUTO VALET cancelled for operational, weather, access, or other policy reasons. |
| `no_show` | Customer/access failure was recorded. |
| `expired` | Payment hold or request expired. |
| `payment_failed` | Deposit payment failed. |
| `refunded` | Refund has been recorded after decline/cancellation policy handling. |

## Blocking Statuses

These statuses block calendar slots:

```text
payment_hold
pending_admin_review
approved
on_the_way
arrived
in_progress
```

All slot generation and conflict checks must import `calendarBlockingStatuses` or `isCalendarBlockingStatus` from the booking domain instead of duplicating lists.

Non-blocking statuses:

```text
declined
reschedule_requested
completed
cancelled_by_customer
cancelled_by_admin
no_show
expired
payment_failed
refunded
```

`reschedule_requested` is currently non-blocking in code, but future admin policy can choose to keep an old slot blocked until the reschedule is resolved.

## Customer Labels

Customer-facing screens must use `getCustomerBookingStatusLabel(status)`.

| Status | Customer Label |
| --- | --- |
| `payment_hold` | Deposit payment in progress |
| `pending_admin_review` | Waiting for approval |
| `approved` | Confirmed |
| `declined` | Declined |
| `reschedule_requested` | New time suggested |
| `completed` | Completed |
| `cancelled_by_customer` | Cancelled |
| `cancelled_by_admin` | Cancelled by AUTO VALET |
| `expired` | Expired |
| `payment_failed` | Payment failed |
| `refunded` | Refunded |

Only `approved` may display the customer label `Confirmed`.

## Admin Labels

Admin screens must use `getAdminBookingStatusLabel(status)`.

| Status | Admin Label |
| --- | --- |
| `payment_hold` | Payment in progress |
| `pending_admin_review` | Needs review |
| `approved` | Approved |
| `declined` | Declined |
| `reschedule_requested` | Reschedule sent |
| `on_the_way` | On the way |
| `arrived` | Arrived |
| `in_progress` | In progress |
| `completed` | Completed |
| `expired` | Expired |
| `payment_failed` | Payment failed |
| `refunded` | Refunded |

## Allowed Transition Table

| From | To |
| --- | --- |
| `draft` | `zone_validated` |
| `zone_validated` | `payment_hold` |
| `payment_hold` | `pending_admin_review`, `expired`, `payment_failed` |
| `pending_admin_review` | `approved`, `declined`, `reschedule_requested` |
| `approved` | `reschedule_requested`, `on_the_way`, `cancelled_by_admin`, `cancelled_by_customer`, `no_show` |
| `on_the_way` | `arrived`, `cancelled_by_admin`, `no_show` |
| `arrived` | `in_progress`, `cancelled_by_admin`, `no_show` |
| `in_progress` | `completed`, `cancelled_by_admin` |
| `reschedule_requested` | `pending_admin_review`, `approved` |
| `declined` | `refunded` |
| `cancelled_by_admin` | `refunded` |
| `cancelled_by_customer` | `refunded` when policy allows |
| `payment_failed` | `expired` |
| `expired` | `draft` only as a new request flow |

Terminal or historical statuses with no default onward transition:

```text
completed
no_show
refunded
```

## Payment Webhook Transitions

Payment does not approve a booking.

| Event | Required Current Status | Target Status |
| --- | --- | --- |
| Successful verified deposit webhook | `payment_hold` | `pending_admin_review` |
| Failed payment webhook | `payment_hold` | `payment_failed` |
| Checkout expiry/system expiry | `payment_hold` | `expired` |

Webhook handlers must verify provider signatures, store webhook events idempotently, then call `assertBookingTransition` before updating booking rows.

## Admin Approval Transitions

Admin approval can only run from `pending_admin_review` to `approved`.

Before writing `approved`, the future admin route must:

- Lock the booking row.
- Check current status is `pending_admin_review`.
- Confirm deposit payment is recorded.
- Re-check calendar conflicts excluding the booking itself.
- Write audit logs and notifications.

Admin decline starts from `pending_admin_review`. Admin reschedule can start from `pending_admin_review` or an already `approved` booking when AUTO VALET needs to propose a new time. Both flows must be transaction-safe.

## Cancellation And Refund Transitions

- `approved -> cancelled_by_customer` records customer cancellation.
- `approved -> cancelled_by_admin` records AUTO VALET cancellation.
- `declined -> refunded` supports refund or transfer policy handling after admin decline.
- `cancelled_by_admin -> refunded` supports operational refund/transfer policy.
- `cancelled_by_customer -> refunded` requires a clear policy reason in the transition context.

Money-changing actions must create audit logs once persistence is connected.

No-show/access failure can be recorded from `approved`, `on_the_way`, or `arrived`. It must not be used before approval or after completion.

## Job-Day Transitions

The strict job-day flow is:

```text
approved
↓
on_the_way
↓
arrived
↓
in_progress
↓
completed
```

`approved -> in_progress` is intentionally not allowed by the central transition map. If the admin app later needs a fast-path button, it should run the intermediate transitions explicitly or introduce a documented policy change.

## Events

Booking event names live in `lib/booking/events.ts` and will feed audit logs and notifications later:

```text
booking_draft_created
zone_validated
payment_hold_created
payment_hold_expired
deposit_paid
booking_request_received
booking_approved
booking_declined
reschedule_requested
customer_cancelled
admin_cancelled
job_started
job_completed
no_show_recorded
refund_recorded
balance_paid
```

## Test Cases

Future unit tests should cover:

1. `payment_hold` can become `pending_admin_review` for actor `payment_webhook`.
2. `payment_hold` cannot become `approved`.
3. `pending_admin_review` can become `approved` for actor `admin`.
4. `approved` cannot become `in_progress` directly while strict job flow is enabled.
5. `declined` is not calendar blocking.
6. `payment_hold` is calendar blocking.
7. Customer label for `approved` is `Confirmed`.
8. Customer label for `pending_admin_review` is `Waiting for approval`.
9. Invalid transitions return `allowed: false` or throw through `assertBookingTransition`.
10. Status labels never expose raw enum values to customers or beginner admins.
