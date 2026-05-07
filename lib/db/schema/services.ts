export const servicesTable = {
  name: "services",
  columns: {
    id: { type: "text", primaryKey: true },
    name: { type: "text", nullable: false },
    type: { type: "text", nullable: false },
    description: { type: "text", nullable: true },
    active: { type: "boolean", nullable: false, default: true },
    displayOrder: { name: "display_order", type: "integer", nullable: false, default: 0 },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    updatedAt: { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "services_active_display_order_idx", columns: ["active", "display_order"] },
  ],
} as const;

export const serviceVariantsTable = {
  name: "service_variants",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    serviceId: { name: "service_id", type: "text", references: "services.id", nullable: false },
    vehicleSize: { name: "vehicle_size", type: "text", nullable: false },
    priceMinor: { name: "price_minor", type: "integer", nullable: false },
    durationMinutes: { name: "duration_minutes", type: "integer", nullable: false },
    active: { type: "boolean", nullable: false, default: true },
  },
  indexes: [
    { name: "service_variants_service_id_idx", columns: ["service_id"] },
    { name: "service_variants_service_size_idx", columns: ["service_id", "vehicle_size"], unique: true },
  ],
  checks: [
    "vehicle_size in ('small', 'medium', 'large_4x4')",
    "price_minor >= 0",
    "duration_minutes > 0",
  ],
} as const;
