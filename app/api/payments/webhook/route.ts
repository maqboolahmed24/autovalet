import { constructStripeWebhookEvent } from "../../../../lib/payments/stripe";
import { mapPaymentWebhookEvent } from "../../../../lib/payments/webhooks";
import { PaymentProviderConfigurationError } from "../../../../lib/payments/types";

export const runtime = "nodejs";

type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  message?: string;
};

type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
};

function jsonResponse<TData>(body: ApiSuccessResponse<TData> | ApiErrorResponse, status = 200) {
  return Response.json(body, { status });
}

function errorResponse(code: string, message: string, status: number, details: Record<string, unknown> = {}) {
  return jsonResponse(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    status,
  );
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return errorResponse("WEBHOOK_SIGNATURE_MISSING", "Payment webhook signature is missing.", 400);
  }

  const payload = await request.text();

  try {
    const event = await constructStripeWebhookEvent(payload, signature);
    const mappedEvent = mapPaymentWebhookEvent(event);

    if (mappedEvent.action === "ignored") {
      return jsonResponse({
        success: true,
        data: {
          received: true,
          eventId: mappedEvent.eventId,
          eventType: mappedEvent.eventType,
          action: mappedEvent.action,
        },
      });
    }

    // TODO: Store webhook event idempotently, update payment rows, and validate every status change
    // through `assertBookingTransition` before moving deposits to pending_admin_review or expiring holds.
    // TODO: On checkout.session.completed, dispatch customer `booking_request_received`
    // and admin `admin_new_booking_request` notifications. On payment failure/expiry,
    // dispatch `payment_failed` or `payment_hold_expired` to the customer when contact data exists.
    return errorResponse(
      "WEBHOOK_PERSISTENCE_NOT_CONFIGURED",
      "Payment webhooks are not connected to booking persistence yet.",
      503,
      {
        eventId: mappedEvent.eventId,
        eventType: mappedEvent.eventType,
        action: mappedEvent.action,
        bookingReference: mappedEvent.bookingReference,
      },
    );
  } catch (error) {
    if (error instanceof PaymentProviderConfigurationError) {
      return errorResponse(error.code, error.message, 503);
    }

    return errorResponse("INVALID_WEBHOOK_SIGNATURE", "Payment webhook signature could not be verified.", 400);
  }
}
