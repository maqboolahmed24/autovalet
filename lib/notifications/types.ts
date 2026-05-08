export type NotificationChannel = "email" | "sms";

export type NotificationRecipientType = "customer" | "admin";

export type NotificationEventType =
  | "booking_request_received"
  | "admin_new_booking_request"
  | "booking_approved"
  | "booking_declined"
  | "reschedule_suggested"
  | "booking_cancelled"
  | "deposit_refunded"
  | "deposit_transferred"
  | "payment_failed"
  | "payment_hold_expired"
  | "appointment_reminder"
  | "manual_booking_created"
  | "final_price_adjusted"
  | "balance_payment_recorded"
  | "no_show_recorded";

export type NotificationBookingSummary = {
  bookingReference: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  requestedDate?: string;
  requestedTime?: string;
  serviceLabel?: string;
  vehicleLabel?: string;
  addressSummary?: string;
  estimatedTotal?: string;
  depositPaid?: string;
  remainingBalance?: string;
  statusLabel?: string;
  zoneStatusLabel?: string;
  isOutsideZoneRequest?: boolean;
};

export type NotificationTemplate = {
  subject: string;
  preview: string;
  text: string;
  html?: string;
};

export type BuildTemplateInput = {
  eventType: NotificationEventType;
  booking: NotificationBookingSummary;
  reason?: string;
  actionUrl?: string;
  businessName?: string;
  recipientType?: NotificationRecipientType;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type SendSmsInput = {
  to: string;
  body: string;
};

export type NotificationProviderResult =
  | {
      success: true;
      providerMessageId?: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export interface NotificationProvider {
  sendEmail(input: SendEmailInput): Promise<NotificationProviderResult>;
  sendSms(input: SendSmsInput): Promise<NotificationProviderResult>;
}

export type DispatchNotificationInput = {
  eventType: NotificationEventType;
  channel: NotificationChannel;
  recipientType: NotificationRecipientType;
  to: string;
  booking: NotificationBookingSummary;
  actionUrl?: string;
  reason?: string;
};

export type NotificationLogStatus = "sent" | "failed" | "provider_not_configured";
