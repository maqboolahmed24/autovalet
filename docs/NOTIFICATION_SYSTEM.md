# Notification System

AUTO VALET notifications must be calm, clear and accurate. A deposit-paid booking is still a booking request until AUTO VALET approves it, so customer templates must never say confirmed except for approved bookings.

This foundation adds provider abstractions, typed templates, a dispatcher and notification log persistence. Real delivery is disabled safely unless a provider is configured.

## Notification Events

Supported notification events:

- `booking_request_received`
- `admin_new_booking_request`
- `booking_approved`
- `booking_declined`
- `reschedule_suggested`
- `booking_cancelled`
- `deposit_refunded`
- `deposit_transferred`
- `payment_failed`
- `payment_hold_expired`
- `appointment_reminder`
- `manual_booking_created`
- `final_price_adjusted`
- `balance_payment_recorded`
- `no_show_recorded`

Booking domain events can be mapped to notification plans in `lib/notifications/events.ts`.

## Customer Templates

Customer templates live in `lib/notifications/templates.ts`.

Required customer rules:

- Booking request received says the deposit was received, the appointment is not confirmed yet, and AUTO VALET will review location, vehicle details and requested time.
- Booking approved is the only standard customer template that says confirmed.
- Booking declined says the request was not approved and references refund/transfer handling.
- Reschedule suggested includes a new time and optional action link.
- Payment failed says no booking request has been submitted.
- Payment hold expired says the temporary hold expired and the slot was released.
- Cancellation, refund, transfer, final price, balance payment and no-show templates keep wording factual and policy-led.

## Admin Templates

Admin templates include:

- New AUTO VALET booking request.
- Manual booking created.
- Generic admin booking update fallback.

New request notifications include:

- Customer
- Requested date/time
- Service
- Vehicle
- Zone status
- Deposit status
- Review link placeholder

Outside-zone requests include:

```text
Outside-zone request - check vehicle count and location.
```

## Provider Abstraction

The provider interface is:

```ts
export interface NotificationProvider {
  sendEmail(input: SendEmailInput): Promise<NotificationProviderResult>;
  sendSms(input: SendSmsInput): Promise<NotificationProviderResult>;
}
```

The dispatcher:

1. Builds the template.
2. Chooses the configured provider.
3. Sends email or SMS.
4. Plans a notification log write.
5. Returns a provider result.
6. Catches provider failures and returns safe messages.

Booking creation or payment processing must not fail just because notification delivery fails.

## Environment Variables

Email uses SMTP. Microsoft 365 from GoDaddy should use SMTP AUTH with:

```text
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_USER=<mailbox email>
SMTP_PASSWORD=<mailbox password or app password>
SMTP_FROM_EMAIL=<mailbox email>
SMTP_FROM_NAME=AUTO VALET
SMTP_REPLY_TO=<optional reply-to mailbox>
NOTIFICATION_ADMIN_EMAIL=<optional admin notification mailbox>
```

If the SMTP settings are missing, email returns:

```json
{
  "success": false,
  "code": "EMAIL_PROVIDER_NOT_CONFIGURED",
  "message": "SMTP email provider is not configured yet."
}
```

SMS is planned for Twilio or another provider. Current SMS result:

```json
{
  "success": false,
  "code": "SMS_PROVIDER_NOT_CONFIGURED",
  "message": "SMS provider is not configured yet."
}
```

## Privacy Rules

1. Do not send full payment provider IDs to customers.
2. Do not send excessive address detail in SMS.
3. Do not send PII to analytics.
4. Do not store full message bodies unless required.
5. Admin emails can contain address summaries but should still avoid unnecessary personal data.

The SMS dispatcher intentionally builds a shorter body from subject, reference, requested time, reason and link instead of reusing the full email text.

## Logging Rules

`lib/db/schema/notification-logs.ts` defines `notification_logs`:

- `id uuid`
- `event_type text`
- `channel text`
- `recipient_type text`
- `recipient text`
- `booking_reference text`
- `provider_message_id text`
- `status text`
- `error_code text`
- `error_message text`
- `created_at timestamptz`

Do not log full message bodies by default. Store only delivery metadata, safe error codes and booking reference.

## Future SMS Plan

SMS should be used carefully for urgent operational updates:

- Appointment reminder.
- Admin urgent outside-zone or payment issue alert.
- Reschedule acceptance reminders.

Before enabling SMS:

1. Add a provider adapter.
2. Add opt-in/consent rules where required.
3. Keep SMS bodies short.
4. Avoid full addresses and payment/provider details.

## Integration Points

Currently wired:

- Public booking request: dispatches customer `booking_request_received` and admin `admin_new_booking_request` after persistence.
- Manual booking creation: dispatches customer `booking_request_received` or `booking_approved`, plus admin `manual_booking_created`.
- Admin approval: dispatches customer `booking_approved`.
- Admin decline: dispatches customer `booking_declined`.
- Admin reschedule suggestion: dispatches customer `reschedule_suggested`.
- Admin cancellation: dispatches customer `booking_cancelled`.
- Final price adjustment: dispatches customer `final_price_adjusted`.
- Balance payment: persists the balance payment and dispatches customer `balance_payment_recorded`.
- No-show flow: dispatches customer `no_show_recorded`.

Still pending because the underlying payment-provider flow is not implemented:

- Payment webhook: dispatch customer `booking_request_received` and admin `admin_new_booking_request` after deposit webhook persistence.
- Payment webhook: dispatch `payment_failed` or `payment_hold_expired` for failed/expired holds.
- Refund flow: dispatch `deposit_refunded`.
- Transfer flow: dispatch `deposit_transferred`.

## Test Checklist

1. Template builder never says confirmed for request-received notifications.
2. Approved template says confirmed.
3. Admin new request template includes customer, time, service, vehicle, zone status and deposit status.
4. Outside-zone admin template includes the warning.
5. Email provider returns `EMAIL_PROVIDER_NOT_CONFIGURED` when SMTP settings are incomplete.
6. SMS provider returns `SMS_PROVIDER_NOT_CONFIGURED`.
7. Dispatcher catches provider errors and does not throw raw errors.
8. Notification failures do not fail booking creation/payment status changes.
9. Notification logs store metadata only, not full sensitive message bodies.
10. SMS body does not include full address detail.
