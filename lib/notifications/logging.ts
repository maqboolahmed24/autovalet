import { randomUUID } from "node:crypto";
import { isDatabaseConfigured, query } from "../db/postgres";
import type {
  DispatchNotificationInput,
  NotificationLogStatus,
  NotificationProviderResult,
} from "./types";

function getLogStatus(result: NotificationProviderResult): NotificationLogStatus {
  if (result.success) {
    return "sent";
  }

  return result.code.includes("NOT_CONFIGURED") ? "provider_not_configured" : "failed";
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

export async function writeNotificationLog(
  input: DispatchNotificationInput,
  result: NotificationProviderResult,
) {
  if (!isDatabaseConfigured()) {
    return;
  }

  try {
    await query(
      `
        INSERT INTO notification_logs (
          id,
          event_type,
          channel,
          recipient_type,
          recipient,
          booking_reference,
          provider_message_id,
          status,
          error_code,
          error_message
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        randomUUID(),
        input.eventType,
        input.channel,
        input.recipientType,
        input.to,
        input.booking.bookingReference || null,
        result.success ? result.providerMessageId ?? null : null,
        getLogStatus(result),
        result.success ? null : result.code,
        result.success ? null : truncate(result.message, 500),
      ],
    );
  } catch {
    // Notification delivery must not fail because delivery metadata could not be stored.
  }
}
