export const notificationLogsTable = {
  name: "notification_logs",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    eventType: { name: "event_type", type: "text", nullable: false },
    channel: { type: "text", nullable: false },
    recipientType: { name: "recipient_type", type: "text", nullable: false },
    recipient: { type: "text", nullable: false },
    bookingReference: { name: "booking_reference", type: "text", nullable: true },
    providerMessageId: { name: "provider_message_id", type: "text", nullable: true },
    status: { type: "text", nullable: false },
    errorCode: { name: "error_code", type: "text", nullable: true },
    errorMessage: { name: "error_message", type: "text", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "notification_logs_booking_reference_idx", columns: ["booking_reference"] },
    { name: "notification_logs_event_type_idx", columns: ["event_type"] },
    { name: "notification_logs_created_at_idx", columns: ["created_at"] },
  ],
  checks: [
    "channel in ('email', 'sms')",
    "recipient_type in ('customer', 'admin')",
    "status in ('sent', 'failed', 'provider_not_configured')",
  ],
} as const;
