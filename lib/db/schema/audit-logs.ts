export const auditLogsTable = {
  name: "audit_logs",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    adminId: { name: "admin_id", type: "uuid", references: "admin_users.id", nullable: true },
    action: { type: "text", nullable: false },
    entityType: { name: "entity_type", type: "text", nullable: false },
    entityId: { name: "entity_id", type: "text", nullable: false },
    oldValue: { name: "old_value", type: "jsonb", nullable: true },
    newValue: { name: "new_value", type: "jsonb", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "audit_logs_admin_id_idx", columns: ["admin_id"] },
    { name: "audit_logs_entity_idx", columns: ["entity_type", "entity_id"] },
    { name: "audit_logs_created_at_idx", columns: ["created_at"] },
  ],
} as const;
