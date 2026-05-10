import { getNotificationProvider } from "./provider";
import { buildNotificationTemplate } from "./templates";
import { writeNotificationLog } from "./logging";
import type {
  DispatchNotificationInput,
  NotificationProviderResult,
} from "./types";

function normalizeSmsBody(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}

function buildSmsBody(input: DispatchNotificationInput, subject: string) {
  const booking = input.booking;
  const parts = [
    subject,
    booking.bookingReference ? `Ref ${booking.bookingReference}.` : "",
    booking.requestedDate && booking.requestedTime
      ? `${booking.requestedDate} at ${booking.requestedTime}.`
      : "",
    input.reason ? `Reason: ${input.reason}.` : "",
    input.actionUrl ? `Link: ${input.actionUrl}` : "",
  ];

  return normalizeSmsBody(parts.filter(Boolean).join(" "));
}

export async function dispatchNotification(
  input: DispatchNotificationInput,
): Promise<NotificationProviderResult> {
  const provider = getNotificationProvider();
  const template = buildNotificationTemplate({
    eventType: input.eventType,
    booking: input.booking,
    reason: input.reason,
    actionUrl: input.actionUrl,
    recipientType: input.recipientType,
  });

  try {
    const result = input.channel === "email"
      ? await provider.sendEmail({
          to: input.to,
          subject: template.subject,
          text: template.text,
          html: template.html,
        })
      : await provider.sendSms({
          to: input.to,
          body: buildSmsBody(input, template.subject),
        });

    await writeNotificationLog(input, result);

    return result;
  } catch {
    const result: NotificationProviderResult = {
      success: false,
      code: "NOTIFICATION_DISPATCH_FAILED",
      message: "Notification could not be sent.",
    };

    await writeNotificationLog(input, result);

    return result;
  }
}
