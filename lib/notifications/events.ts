import type { BookingEventType } from "../booking/events";
import type { NotificationEventType, NotificationRecipientType } from "./types";

export type NotificationEventPlan = {
  eventType: NotificationEventType;
  recipientType: NotificationRecipientType;
  channel: "email" | "sms";
};

export const notificationEvents = [
  "booking_request_received",
  "admin_new_booking_request",
  "booking_approved",
  "booking_declined",
  "reschedule_suggested",
  "booking_cancelled",
  "deposit_refunded",
  "deposit_transferred",
  "payment_failed",
  "payment_hold_expired",
  "appointment_reminder",
  "manual_booking_created",
  "final_price_adjusted",
  "balance_payment_recorded",
  "no_show_recorded",
] as const satisfies readonly NotificationEventType[];

export function getNotificationPlanForBookingEvent(
  eventType: BookingEventType,
): NotificationEventPlan[] {
  // TODO: Future admin approve/decline/reschedule routes should call the dispatcher
  // with booking_approved, booking_declined or reschedule_suggested after status persistence succeeds.
  switch (eventType) {
    case "booking_request_received":
    case "deposit_paid":
      return [
        { eventType: "booking_request_received", recipientType: "customer", channel: "email" },
        { eventType: "admin_new_booking_request", recipientType: "admin", channel: "email" },
      ];
    case "booking_approved":
      return [{ eventType: "booking_approved", recipientType: "customer", channel: "email" }];
    case "booking_declined":
      return [{ eventType: "booking_declined", recipientType: "customer", channel: "email" }];
    case "reschedule_requested":
      return [{ eventType: "reschedule_suggested", recipientType: "customer", channel: "email" }];
    case "customer_cancelled":
    case "admin_cancelled":
      return [{ eventType: "booking_cancelled", recipientType: "customer", channel: "email" }];
    case "refund_recorded":
      return [{ eventType: "deposit_refunded", recipientType: "customer", channel: "email" }];
    case "balance_paid":
      return [{ eventType: "balance_payment_recorded", recipientType: "customer", channel: "email" }];
    case "no_show_recorded":
      return [{ eventType: "no_show_recorded", recipientType: "customer", channel: "email" }];
    case "payment_hold_expired":
      return [{ eventType: "payment_hold_expired", recipientType: "customer", channel: "email" }];
    default:
      return [];
  }
}

export function shouldNotifyCustomer(eventType: NotificationEventType) {
  return eventType !== "admin_new_booking_request" && eventType !== "manual_booking_created";
}
