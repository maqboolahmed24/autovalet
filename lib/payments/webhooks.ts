import type { PaymentWebhookEvent, PaymentWebhookProcessingResult } from "./types";

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getMetadata(event: PaymentWebhookEvent) {
  const metadata = event.data.metadata;

  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function getBookingReference(event: PaymentWebhookEvent) {
  const metadata = getMetadata(event);

  return readString(metadata.bookingReference) || readString(event.data.client_reference_id);
}

function getProviderSessionId(event: PaymentWebhookEvent) {
  return readString(event.data.id);
}

export function mapPaymentWebhookEvent(event: PaymentWebhookEvent): PaymentWebhookProcessingResult {
  const bookingReference = getBookingReference(event) || undefined;
  const providerSessionId = getProviderSessionId(event) || undefined;

  switch (event.type) {
    case "checkout.session.completed":
      return {
        eventId: event.id,
        eventType: event.type,
        action: "deposit_paid",
        bookingReference,
        providerSessionId,
      };
    case "payment_intent.payment_failed":
      return {
        eventId: event.id,
        eventType: event.type,
        action: "payment_failed",
        bookingReference,
        providerSessionId,
      };
    case "checkout.session.expired":
      return {
        eventId: event.id,
        eventType: event.type,
        action: "checkout_expired",
        bookingReference,
        providerSessionId,
      };
    default:
      return {
        eventId: event.id,
        eventType: event.type,
        action: "ignored",
        bookingReference,
        providerSessionId,
      };
  }
}
