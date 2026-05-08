# Final Price And Balance Flow

AUTO VALET shows customers an estimated total before the deposit checkout. The final price can change after arrival when vehicle condition, access, selected extras, or required work differs from the original request.

The estimate must never be overwritten. Admin adjustments store the final price separately and keep the reason visible for audit, customer support, and future payment work.

## Booking Fields

The booking schema already includes the required financial fields:

- `estimated_total_minor`
- `final_total_minor`
- `price_adjustment_reason`
- `deposit_paid_minor`
- `balance_due_minor`
- `balance_paid_minor`
- `currency`

All money values are integer minor units in GBP pence. UI inputs may accept pounds, but API and domain functions use minor units.

## Allowed Statuses

Final price adjustment is allowed for active or completed work states:

- `approved`
- `on_the_way`
- `arrived`
- `in_progress`
- `completed`

Adjustment is not allowed for draft, payment hold, expired, payment failed, declined, refunded, or cancelled bookings.

Balance payment can be recorded for the same active or completed work states. It cannot be recorded when no balance remains.

## Adjustment Rules

Admin must enter:

- Final price
- Reason for adjustment

The reason is required and must be at least 5 characters. This supports audit logs and explains why the customer-facing estimate changed.

If the final price is lower than the deposit already paid, the normal adjustment flow blocks the change. That case needs a refund or explicit admin override flow, which is not implemented in this foundation.

## Balance Formula

The payable total is:

```ts
finalTotalMinor ?? estimatedTotalMinor
```

The remaining balance is:

```ts
Math.max(payableTotal - depositPaidMinor - balancePaidMinor, 0)
```

Changing `final_total_minor` recalculates `balance_due_minor`. Marking a balance payment increases `balance_paid_minor` and recalculates `balance_due_minor`.

## Payment Methods

Admin balance payments support:

- `cash`
- `bank_transfer`
- `card_reader`
- `payment_link`
- `other`

The payment record should use `payment_type = "balance"` and should not modify deposit payment records.

## API Contracts

### Adjust Final Price

`PATCH /api/admin/bookings/[id]/adjust-final-price`

Request:

```json
{
  "finalTotalMinor": 9500,
  "reason": "Heavy pet hair and staining required additional time."
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "finalTotalMinor": 9500,
    "balanceDueMinor": 6500
  },
  "message": "Final price updated."
}
```

Current foundation behavior:

- Validates request shape and amount.
- Calls the central final-price domain function.
- Uses the admin route guard and returns safe 501 responses until session persistence, booking lookup, and database persistence are connected.

### Mark Balance Paid

`POST /api/admin/bookings/[id]/mark-balance-paid`

Request:

```json
{
  "amountPaidMinor": 6500,
  "paymentMethod": "cash",
  "note": "Paid on completion",
  "paidAt": "2026-05-18T16:30:00.000Z"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "balancePaidMinor": 6500,
    "balanceDueMinor": 0,
    "paymentStatus": "fully_paid"
  },
  "message": "Balance payment recorded."
}
```

Current foundation behavior:

- Validates amount and payment method.
- Calls the central balance payment domain function.
- Uses the admin route guard and returns safe 501 responses until session persistence, booking lookup, and database persistence are connected.

## Audit Log Requirements

Final price adjustment should write an audit log entry with:

- Admin id
- Booking id
- Previous final total
- New final total
- Previous balance due
- New balance due
- Adjustment reason

Balance payment should write an audit log entry with:

- Admin id
- Booking id
- Amount paid
- Payment method
- Note
- Previous balance paid
- New balance paid
- Previous balance due
- New balance due

Both updates should run inside database transactions once persistence is connected.

## Edge Cases

1. Final total lower than deposit paid: block until refund or override flow exists.
2. Customer already paid part of the balance: subtract existing `balance_paid_minor` before calculating the new balance due.
3. Invalid amount: reject non-integer, negative, and non-finite minor-unit values.
4. Declined, expired, or payment-failed booking: reject adjustment and balance payment.
5. Duplicate mark-paid submission: reject overpayment unless an overpayment flow exists.
6. Partial balance payment: allow amount below current balance due and keep the booking partially paid.
7. Admin correction after completion: allowed, but still requires a reason and audit log.
8. Refund required: handled by a future refund flow, not this foundation.

## Future Payment Links

The `payment_link` method is included for future Stripe balance collection. The later implementation should create a balance checkout/payment-link session, verify webhooks idempotently, create a `balance` payment record, and update `balance_paid_minor` only after payment confirmation.
