export const adminUsersTable = {
  name: "admin_users",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    fullName: { name: "full_name", type: "text", nullable: false },
    email: { type: "text", nullable: false, unique: true },
    passwordHash: { name: "password_hash", type: "text", nullable: false },
    role: { type: "text", nullable: false },
    twoFactorEnabled: { name: "two_factor_enabled", type: "boolean", nullable: false, default: false },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    updatedAt: { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "admin_users_email_idx", columns: ["email"], unique: true },
    { name: "admin_users_role_idx", columns: ["role"] },
  ],
  checks: [
    "role in ('owner', 'manager', 'staff', 'read_only')",
  ],
} as const;
