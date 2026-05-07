export const customersTable = {
  name: "customers",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    fullName: { name: "full_name", type: "text", nullable: false },
    phone: { type: "text", nullable: false },
    email: { type: "text", nullable: false },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    updatedAt: { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "customers_email_idx", columns: ["email"] },
    { name: "customers_phone_idx", columns: ["phone"] },
  ],
} as const;
