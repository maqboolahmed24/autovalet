export type PaymentCurrency = "GBP";

export type PaymentProviderName = "stripe";

export type CreateCheckoutSessionInput = {
  bookingReference: string;
  amountMinor: number;
  currency: PaymentCurrency;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
};

export type CheckoutSessionResult = {
  checkoutUrl: string;
  providerSessionId: string;
};

export interface PaymentProvider {
  name: PaymentProviderName;
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult>;
}

export type PaymentWebhookEvent = {
  id: string;
  type: string;
  provider: PaymentProviderName;
  data: Record<string, unknown>;
};

export type PaymentWebhookAction =
  | "deposit_paid"
  | "payment_failed"
  | "checkout_expired"
  | "ignored";

export type PaymentWebhookProcessingResult = {
  eventId: string;
  eventType: string;
  action: PaymentWebhookAction;
  bookingReference?: string;
  providerSessionId?: string;
};

export class PaymentProviderConfigurationError extends Error {
  code = "PAYMENT_PROVIDER_NOT_CONFIGURED" as const;

  constructor(message = "Deposit checkout is not configured yet.") {
    super(message);
    this.name = "PaymentProviderConfigurationError";
  }
}

export class PaymentProviderRequestError extends Error {
  code = "PAYMENT_PROVIDER_REQUEST_FAILED" as const;

  constructor(message = "Deposit checkout could not be started.") {
    super(message);
    this.name = "PaymentProviderRequestError";
  }
}
