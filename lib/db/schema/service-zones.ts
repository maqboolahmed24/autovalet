export const serviceZonesTable = {
  name: "service_zones",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    zoneType: { name: "zone_type", type: "text", nullable: false },
    value: { type: "text", nullable: false },
    normalizedValue: { name: "normalized_value", type: "text", nullable: false },
    active: { type: "boolean", nullable: false, default: true },
    notes: { type: "text", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "service_zones_zone_normalized_idx", columns: ["zone_type", "normalized_value"] },
    {
      name: "service_zones_active_zone_normalized_unique",
      columns: ["zone_type", "normalized_value"],
      unique: true,
      where: "active = true",
    },
  ],
  checks: [
    "zone_type in ('exact_postcode', 'outward_code', 'postcode_district', 'region')",
  ],
} as const;
