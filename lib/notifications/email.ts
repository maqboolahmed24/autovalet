import type { NotificationProviderResult, SendEmailInput } from "./types";

type ResendSendResult = {
  data?: {
    id?: string;
  } | null;
  error?: {
    message?: string;
  } | null;
};

type ResendClientLike = {
  emails: {
    send(input: Record<string, unknown>): Promise<ResendSendResult>;
  };
};

type ResendConstructor = new (apiKey: string) => ResendClientLike;

function readEnvironmentVariable(name: string) {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return globalWithProcess.process?.env?.[name] ?? "";
}

function getResendApiKey() {
  return readEnvironmentVariable("RESEND_API_KEY");
}

function getFromEmail() {
  return readEnvironmentVariable("RESEND_FROM_EMAIL") || "AUTO VALET <no-reply@autovalet.example>";
}

async function loadResendConstructor() {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<{ Resend?: unknown; default?: unknown }>;
    const resendModule = await dynamicImport("resend");
    const Constructor = resendModule.Resend ?? resendModule.default;

    if (typeof Constructor !== "function") {
      return null;
    }

    return Constructor as ResendConstructor;
  } catch {
    return null;
  }
}

export function isEmailProviderConfigured() {
  return Boolean(getResendApiKey());
}

export async function sendEmail(input: SendEmailInput): Promise<NotificationProviderResult> {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    return {
      success: false,
      code: "EMAIL_PROVIDER_NOT_CONFIGURED",
      message: "Email provider is not configured yet.",
    };
  }

  const Resend = await loadResendConstructor();

  if (!Resend) {
    return {
      success: false,
      code: "EMAIL_PROVIDER_NOT_CONFIGURED",
      message: "Email provider package is not installed yet.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      reply_to: input.replyTo,
    });

    if (result.error) {
      return {
        success: false,
        code: "EMAIL_PROVIDER_SEND_FAILED",
        message: result.error.message || "Email provider could not send the message.",
      };
    }

    return {
      success: true,
      providerMessageId: result.data?.id,
    };
  } catch {
    return {
      success: false,
      code: "EMAIL_PROVIDER_SEND_FAILED",
      message: "Email provider could not send the message.",
    };
  }
}
