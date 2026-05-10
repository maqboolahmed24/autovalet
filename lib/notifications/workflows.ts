import { dispatchNotification } from "./dispatcher";
import { getAdminNotificationEmail } from "./recipients";
import type {
  NotificationBookingSummary,
  NotificationEventType,
  NotificationProviderResult,
} from "./types";

type BookingNotificationOptions = {
  reason?: string;
  actionUrl?: string;
  customerActionUrl?: string;
  adminActionUrl?: string;
};

const skippedNotificationResult: NotificationProviderResult = {
  success: false,
  code: "NOTIFICATION_RECIPIENT_MISSING",
  message: "Notification recipient is missing.",
};

async function dispatchCustomerNotification(
  eventType: NotificationEventType,
  booking: NotificationBookingSummary,
  options: BookingNotificationOptions = {},
) {
  if (!booking.customerEmail?.trim()) {
    return skippedNotificationResult;
  }

  return dispatchNotification({
    eventType,
    channel: "email",
    recipientType: "customer",
    to: booking.customerEmail,
    reason: options.reason,
    actionUrl: options.actionUrl,
    booking,
  });
}

async function dispatchAdminNotification(
  eventType: NotificationEventType,
  booking: NotificationBookingSummary,
  options: BookingNotificationOptions = {},
) {
  const adminEmail = getAdminNotificationEmail();

  if (!adminEmail) {
    return skippedNotificationResult;
  }

  return dispatchNotification({
    eventType,
    channel: "email",
    recipientType: "admin",
    to: adminEmail,
    reason: options.reason,
    actionUrl: options.actionUrl,
    booking,
  });
}

export async function dispatchBookingRequestNotifications(
  booking: NotificationBookingSummary,
  options: {
    customerActionUrl?: string;
    adminActionUrl?: string;
  } = {},
) {
  const results = await Promise.allSettled([
    dispatchCustomerNotification("booking_request_received", booking, {
      actionUrl: options.customerActionUrl,
    }),
    dispatchAdminNotification("admin_new_booking_request", booking, {
      actionUrl: options.adminActionUrl,
    }),
  ]);

  return results;
}

export async function dispatchManualBookingCreatedNotifications(
  booking: NotificationBookingSummary,
  options: {
    customerActionUrl?: string;
    adminActionUrl?: string;
    customerEventType: "booking_request_received" | "booking_approved";
  },
) {
  const results = await Promise.allSettled([
    dispatchCustomerNotification(options.customerEventType, booking, {
      actionUrl: options.customerActionUrl,
    }),
    dispatchAdminNotification("manual_booking_created", booking, {
      actionUrl: options.adminActionUrl,
    }),
  ]);

  return results;
}

export async function dispatchCustomerBookingUpdateNotification(
  eventType: NotificationEventType,
  booking: NotificationBookingSummary,
  options: BookingNotificationOptions = {},
) {
  const result = await Promise.allSettled([
    dispatchCustomerNotification(eventType, booking, {
      reason: options.reason,
      actionUrl: options.customerActionUrl ?? options.actionUrl,
    }),
  ]);

  return result;
}

export async function dispatchBookingUpdateNotifications(
  eventType: NotificationEventType,
  booking: NotificationBookingSummary,
  options: BookingNotificationOptions = {},
) {
  const result = await Promise.allSettled([
    dispatchCustomerNotification(eventType, booking, {
      reason: options.reason,
      actionUrl: options.customerActionUrl ?? options.actionUrl,
    }),
    dispatchAdminNotification(eventType, booking, {
      reason: options.reason,
      actionUrl: options.adminActionUrl ?? options.actionUrl,
    }),
  ]);

  return result;
}
