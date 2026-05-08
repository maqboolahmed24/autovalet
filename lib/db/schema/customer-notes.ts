export const customerNotesTable = {
  name: "customer_notes",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    customerId: { name: "customer_id", type: "uuid", references: "customers.id", nullable: false },
    adminId: { name: "admin_id", type: "uuid", references: "admin_users.id", nullable: true },
    note: { type: "text", nullable: false },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    updatedAt: { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "customer_notes_customer_id_idx", columns: ["customer_id"] },
    { name: "customer_notes_admin_id_idx", columns: ["admin_id"] },
    { name: "customer_notes_created_at_idx", columns: ["created_at"] },
  ],
} as const;
