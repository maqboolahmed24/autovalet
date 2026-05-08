export const privacyDataRequestsTable = {
  name: "privacy_data_requests",
  columns: {
    id: { type: "text", primaryKey: true },
    reference: { type: "text", nullable: false, unique: true },
    fullName: { name: "full_name", type: "text", nullable: false },
    email: { type: "text", nullable: false },
    phone: { type: "text", nullable: true },
    requestType: { name: "request_type", type: "text", nullable: false },
    message: { type: "text", nullable: true },
    status: { type: "text", nullable: false, default: "received" },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    updatedAt: { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    completedAt: { name: "completed_at", type: "timestamptz", nullable: true },
    adminNotes: { name: "admin_notes", type: "text", nullable: true },
  },
  indexes: [
    { name: "privacy_data_requests_reference_idx", columns: ["reference"], unique: true },
    { name: "privacy_data_requests_status_idx", columns: ["status"] },
    { name: "privacy_data_requests_created_at_idx", columns: ["created_at"] },
    { name: "privacy_data_requests_email_idx", columns: ["email"] },
  ],
  checks: [
    "request_type in ('access', 'deletion', 'correction', 'marketing_consent_withdrawal')",
    "status in ('received', 'in_review', 'completed', 'rejected')",
  ],
} as const;
