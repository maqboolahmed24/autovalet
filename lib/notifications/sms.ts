import type { NotificationProviderResult, SendSmsInput } from "./types";

export function isSmsProviderConfigured() {
  return false;
}

export async function sendSms(_input: SendSmsInput): Promise<NotificationProviderResult> {
  return {
    success: false,
    code: "SMS_PROVIDER_NOT_CONFIGURED",
    message: "SMS provider is not configured yet.",
  };
}
