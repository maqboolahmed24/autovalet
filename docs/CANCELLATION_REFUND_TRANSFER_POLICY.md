# Cancellation, Refund, Transfer And No-Show Policy

AUTO VALET is a manual approval booking request system. A paid deposit does not confirm an appointment until AUTO VALET approves it.

This foundation creates reusable policy, payment and admin action layers. Database writes, payment provider refund execution, admin authentication and audit-log persistence are intentionally safe placeholders until those systems are connected.

## Business Rules

1. Booking requests are not confirmed until admin approval.
2. If AUTO VALET declines before approval, the deposit can be refunded or transferred.
3. If AUTO VALET cancels due to weather, operational issue or service unsuitability, the deposit can be refunded or transferred.
4. If the customer cancels more than 48 hours before an approved appointment, the deposit may be transferred once.
5. If the customer cancels within 48 hours, the deposit may be non-refundable according to policy.
6. If the customer is unavailable on arrival, the vehicle is inaccessible, or no suitable parking/access is available, admin can mark no-show/access failure.
7. No-show/access failure may forfeit the deposit according to policy.
8. Refunds and transfers are admin-controlled actions.
9. Refunds must not be faked when provider or persistence is not configured.
10. Every financial or cancellation action must write an audit log once persistence is connected.

## Cancellation Decision Table

| Scenario | Recommended booking status | Allowed deposit actions | Default action |
| --- | --- | --- | --- |
| Pending review + admin decline | `declined` | Refund, transfer | Refund |
| Approved + admin weather | `cancelled_by_admin` | Refund, transfer | Transfer |
| Approved + admin operational issue | `cancelled_by_admin` | Refund, transfer | Refund |
| Approved + customer cancellation more than 48 hours before appointment | `cancelled_by_customer` | Transfer, keep according to policy | Transfer |
| Approved + customer cancellation within 48 hours | `cancelled_by_customer` | Keep according to policy, transfer | Keep according to policy |
| Payment hold | Not handled here | None | Use hold expiry/payment failed flow |
| Already cancelled | Not handled here | Refund, transfer, keep according to policy | Use direct refund/transfer action |

If no deposit is recorded, the only deposit action is `no_deposit_action_required`.

## Deposit Actions

- `refund`: return the deposit through the payment provider when configured.
- `transfer`: record the deposit against a future booking or rescheduled date.
- `keep_according_to_policy`: record that the deposit is retained under the policy.
- `no_deposit_action_required`: no deposit exists or no financial action is needed.

## Refund Flow

`refundDeposit` validates:

- Booking id
- Admin id
- Positive integer minor-unit refund amount
- Refund reason of at least 5 characters
- Admin authentication and permission
- Payment provider and persistence configuration

Current implementation returns safe failures until provider execution and persistence are wired. It does not fake successful refunds.

Future implementation must:

1. Lock the booking/payment rows.
2. Check the booking is eligible for refund.
3. Submit the refund to Stripe or the configured provider.
4. Store the refund payment record with `payment_type = "refund"`.
5. Update booking/payment status only after provider confirmation or a pending provider response.
6. Write an audit log.

## Transfer Flow

Deposit transfer means money does not leave the payment provider immediately. It records that a paid deposit is held against a future booking or reschedule.

`transferDeposit` validates:

- Source booking id
- Admin id
- Positive integer minor-unit transfer amount
- Transfer reason of at least 5 characters
- Admin authentication and permission
- Persistence configuration

Future implementation must record a transfer payment row, link to a future booking when present, and write an audit log.

## No-Show And Access Failure Flow

No-show can be recorded only from:

- `approved`
- `on_the_way`
- `arrived`

It is not allowed before approval, after completion, on declined/expired/payment-failed bookings, or after refund.

Allowed reasons:

- `customer_unavailable`
- `vehicle_inaccessible`
- `no_parking`
- `unsafe_location`
- `other`

The default deposit action is `keep_according_to_policy` when a deposit is recorded.

## Weather Reschedule Flow

Weather can make mobile detailing unsafe or unsuitable. The recommended policy is to transfer the deposit to a new agreed date.

Weather and related operational reasons:

- `weather`
- `access_or_parking_issue`
- `vehicle_unsuitable`
- `admin_operational_issue`

Future reschedule implementation should use the availability engine to choose a new requested/confirmed time and record the deposit transfer if a booking is moved.

## API Contracts

### Cancel Booking

`POST /api/admin/bookings/[id]/cancel`

```json
{
  "actor": "admin",
  "reason": "weather",
  "depositAction": "transfer",
  "notes": "Weather unsuitable for mobile detailing."
}
```

Current response while persistence/auth is missing:

```json
{
  "success": false,
  "error": {
    "code": "ADMIN_AUTH_NOT_CONFIGURED",
    "message": "Admin authentication is not configured yet.",
    "details": {}
  }
}
```

Invalid policy or lifecycle transitions return `409`.

### Refund Deposit

`POST /api/admin/bookings/[id]/refund-deposit`

```json
{
  "amountMinor": 3000,
  "reason": "AUTO VALET declined before approval."
}
```

Provider or persistence placeholders return `501`. Successful refunds must not be returned until a real provider adapter is connected.

### Transfer Deposit

`POST /api/admin/bookings/[id]/transfer-deposit`

```json
{
  "amountMinor": 3000,
  "reason": "Weather reschedule agreed with customer.",
  "futureBookingReference": "AV-2026-8F3K"
}
```

Transfer persistence placeholders return `501`.

### Mark No-Show

`POST /api/admin/bookings/[id]/mark-no-show`

```json
{
  "reason": "vehicle_inaccessible",
  "notes": "Vehicle was behind locked gate and customer could not be reached."
}
```

Invalid no-show status transitions return `409`.

## Audit Log Requirements

Cancellation action:

- Admin id
- Booking id
- Previous status
- New status
- Actor
- Reason
- Deposit action
- Notes

Refund action:

- Admin id
- Booking id
- Payment id
- Amount
- Reason
- Provider refund id
- Previous payment status
- New payment status

Transfer action:

- Admin id
- Source booking id
- Future booking id/reference when present
- Amount
- Reason
- Previous payment status
- New transfer status

No-show action:

- Admin id
- Booking id
- Previous status
- Reason
- Notes
- Deposit action

All writes must be idempotent or protected with idempotency keys/unique constraints before launch.

## Edge Cases

1. Deposit not paid: use `no_deposit_action_required`.
2. Booking already refunded: block cancellation/refund duplication.
3. Booking already cancelled: use refund or transfer actions, not a second cancellation.
4. Customer cancellation inside 48 hours: default to keeping the deposit according to policy.
5. Admin weather cancellation: default to deposit transfer.
6. Access failure after arrival: mark no-show/access failure and keep deposit according to policy.
7. Provider refund failure: keep booking/payment state unchanged and surface a safe admin error.
8. Partial refund: supported later by refund amount validation and payment records.
9. Transfer to future booking not yet created: record as pending future booking once persistence exists.
10. Duplicate refund button click: use idempotency and payment state checks before provider calls.
