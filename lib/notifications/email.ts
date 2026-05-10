import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { NotificationProviderResult, SendEmailInput } from "./types";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  requireTls: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
};

function readEnvironmentVariable(name: string) {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return globalWithProcess.process?.env?.[name]?.trim() ?? "";
}

function readBooleanEnvironmentVariable(name: string, fallback: boolean) {
  const value = readEnvironmentVariable(name).toLowerCase();

  if (!value) return fallback;
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;

  return fallback;
}

function readIntegerEnvironmentVariable(name: string) {
  const value = readEnvironmentVariable(name);

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) ? parsed : null;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = readEnvironmentVariable("SMTP_HOST");
  const port = readIntegerEnvironmentVariable("SMTP_PORT");
  const user = readEnvironmentVariable("SMTP_USER");
  const password = readEnvironmentVariable("SMTP_PASSWORD");
  const fromEmail = readEnvironmentVariable("SMTP_FROM_EMAIL") || user;
  const fromName = readEnvironmentVariable("SMTP_FROM_NAME") || "AUTO VALET";
  const replyTo = readEnvironmentVariable("SMTP_REPLY_TO") || undefined;

  if (!host || !port || !user || !password || !fromEmail) {
    return null;
  }

  return {
    host,
    port,
    secure: readBooleanEnvironmentVariable("SMTP_SECURE", port === 465),
    requireTls: readBooleanEnvironmentVariable("SMTP_REQUIRE_TLS", port !== 465),
    user,
    password,
    fromEmail,
    fromName,
    replyTo,
  };
}

export function isEmailProviderConfigured() {
  return Boolean(getSmtpConfig());
}

function createTransport(config: SmtpConfig) {
  const transportOptions: SMTPTransport.Options = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTls,
    auth: {
      user: config.user,
      pass: config.password,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
  };

  return nodemailer.createTransport(transportOptions);
}

function getSafeProviderErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Email provider could not send the message.";
}

export async function sendEmail(input: SendEmailInput): Promise<NotificationProviderResult> {
  const config = getSmtpConfig();

  if (!config) {
    return {
      success: false,
      code: "EMAIL_PROVIDER_NOT_CONFIGURED",
      message: "SMTP email provider is not configured yet.",
    };
  }

  if (!input.to.trim()) {
    return {
      success: false,
      code: "EMAIL_RECIPIENT_MISSING",
      message: "Email recipient is missing.",
    };
  }

  try {
    const transporter = createTransport(config);
    const result = await transporter.sendMail({
      from: {
        name: config.fromName,
        address: config.fromEmail,
      },
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo || config.replyTo,
    });

    return {
      success: true,
      providerMessageId: result.messageId,
    };
  } catch (error) {
    return {
      success: false,
      code: "EMAIL_PROVIDER_SEND_FAILED",
      message: getSafeProviderErrorMessage(error),
    };
  }
}
