export const addonsTable = {
  name: "addons",
  columns: {
    id: { type: "text", primaryKey: true },
    name: { type: "text", nullable: false },
    priceMinor: { name: "price_minor", type: "integer", nullable: false },
    extraDurationMinutes: { name: "extra_duration_minutes", type: "integer", nullable: false, default: 0 },
    active: { type: "boolean", nullable: false, default: true },
    displayOrder: { name: "display_order", type: "integer", nullable: false, default: 0 },
  },
  indexes: [
    { name: "addons_active_display_order_idx", columns: ["active", "display_order"] },
  ],
  checks: [
    "price_minor >= 0",
    "extra_duration_minutes >= 0",
  ],
} as const;
