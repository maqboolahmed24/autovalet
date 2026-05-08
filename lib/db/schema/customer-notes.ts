export const customerNotesTable = {
  name: "customer_notes",
  columns: {
    id: { type: "text", primaryKey: true },
    customerId: { name: "customer_id", type: "text", references: "customers.id", nullable: false },
    adminId: { name: "admin_id", type: "text", nullable: true },
    adminName: { name: "admin_name", type: "text", nullable: true },
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
