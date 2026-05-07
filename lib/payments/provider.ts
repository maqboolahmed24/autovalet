import { createStripePaymentProvider, isStripePaymentConfigured } from "./stripe";
import type { PaymentProvider } from "./types";

function readEnvironmentVariable(name: string) {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return globalWithProcess.process?.env?.[name] ?? "";
}

export function getPaymentProvider(): PaymentProvider {
  return createStripePaymentProvider();
}

export function isPaymentProviderConfigured() {
  return isStripePaymentConfigured();
}

export function getSiteUrl(request: Request) {
  const configuredUrl =
    readEnvironmentVariable("NEXT_PUBLIC_SITE_URL") ||
    readEnvironmentVariable("SITE_URL") ||
    (readEnvironmentVariable("VERCEL_URL") ? `https://${readEnvironmentVariable("VERCEL_URL")}` : "");

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}
