export const webhookEventsTable = {
  name: "webhook_events",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    gateway: { type: "text", nullable: false },
    eventId: { name: "event_id", type: "text", nullable: false, unique: true },
    eventType: { name: "event_type", type: "text", nullable: false },
    payload: { type: "jsonb", nullable: false },
    processedAt: { name: "processed_at", type: "timestamptz", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "webhook_events_event_id_idx", columns: ["event_id"], unique: true },
    { name: "webhook_events_gateway_event_type_idx", columns: ["gateway", "event_type"] },
  ],
} as const;
