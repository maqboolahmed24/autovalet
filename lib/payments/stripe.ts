import type {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentProvider,
  PaymentWebhookEvent,
} from "./types";
import { PaymentProviderConfigurationError, PaymentProviderRequestError } from "./types";

type StripeCheckoutSession = {
  id: string;
  url?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
  payment_intent?: string | null;
};

type StripeEventLike = {
  id: string;
  type: string;
  data?: {
    object?: Record<string, unknown>;
  };
};

type StripeClientLike = {
  checkout: {
    sessions: {
      create(input: Record<string, unknown>, options?: Record<string, unknown>): Promise<StripeCheckoutSession>;
    };
  };
  webhooks: {
    constructEvent(payload: string, signature: string, secret: string): StripeEventLike;
  };
};

type StripeConstructor = new (secretKey: string, config?: Record<string, unknown>) => StripeClientLike;

function readEnvironmentVariable(name: string) {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return globalWithProcess.process?.env?.[name] ?? "";
}

async function loadStripeConstructor() {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<{ default?: unknown }>;
    const stripeModule = await dynamicImport("stripe");

    if (typeof stripeModule.default !== "function") {
      throw new PaymentProviderConfigurationError("Stripe SDK is not available.");
    }

    return stripeModule.default as StripeConstructor;
  } catch (error) {
    if (error instanceof PaymentProviderConfigurationError) {
      throw error;
    }

    throw new PaymentProviderConfigurationError("Stripe SDK is not installed.");
  }
}

function getStripeSecretKey() {
  return readEnvironmentVariable("STRIPE_SECRET_KEY");
}

function getStripeWebhookSecret() {
  return readEnvironmentVariable("STRIPE_WEBHOOK_SECRET");
}

export function isStripePaymentConfigured() {
  return Boolean(getStripeSecretKey());
}

export function isStripeWebhookConfigured() {
  return Boolean(getStripeSecretKey() && getStripeWebhookSecret());
}

async function getStripeClient() {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    throw new PaymentProviderConfigurationError();
  }

  const Stripe = await loadStripeConstructor();

  return new Stripe(secretKey);
}

export function createStripePaymentProvider(): PaymentProvider {
  return {
    name: "stripe",
    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult> {
      if (input.amountMinor <= 0) {
        throw new PaymentProviderRequestError("Deposit amount must be greater than zero.");
      }

      const stripe = await getStripeClient();
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: input.customerEmail,
          client_reference_id: input.bookingReference,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: input.currency.toLowerCase(),
                unit_amount: input.amountMinor,
                product_data: {
                  name: "AUTO VALET booking request deposit",
                  description: "Deposit for a manually reviewed booking request.",
                },
              },
            },
          ],
          metadata: {
            ...input.metadata,
            bookingReference: input.bookingReference,
          },
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
        },
        {
          idempotencyKey: input.idempotencyKey,
        },
      );

      if (!session.url) {
        throw new PaymentProviderRequestError("Stripe did not return a checkout URL.");
      }

      return {
        checkoutUrl: session.url,
        providerSessionId: session.id,
      };
    },
  };
}

export async function constructStripeWebhookEvent(payload: string, signature: string): Promise<PaymentWebhookEvent> {
  const webhookSecret = getStripeWebhookSecret();

  if (!webhookSecret) {
    throw new PaymentProviderConfigurationError("Stripe webhook signing secret is not configured.");
  }

  const stripe = await getStripeClient();
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  return {
    id: event.id,
    type: event.type,
    provider: "stripe",
    data: (event.data?.object ?? {}) as Record<string, unknown>,
  };
}
