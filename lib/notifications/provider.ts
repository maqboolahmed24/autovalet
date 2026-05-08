import { sendEmail } from "./email";
import { sendSms } from "./sms";
import type { NotificationProvider } from "./types";

export function getNotificationProvider(): NotificationProvider {
  return {
    sendEmail,
    sendSms,
  };
}
