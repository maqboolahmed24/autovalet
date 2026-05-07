export const availabilityRulesTable = {
  name: "availability_rules",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    weekday: { type: "integer", nullable: false },
    startTime: { name: "start_time", type: "text", nullable: false },
    endTime: { name: "end_time", type: "text", nullable: false },
    active: { type: "boolean", nullable: false, default: true },
  },
  indexes: [
    { name: "availability_rules_weekday_active_idx", columns: ["weekday", "active"] },
  ],
  checks: [
    "weekday between 0 and 6",
  ],
} as const;

export const availabilityOverridesTable = {
  name: "availability_overrides",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    date: { type: "date", nullable: false },
    startTime: { name: "start_time", type: "text", nullable: true },
    endTime: { name: "end_time", type: "text", nullable: true },
    type: { type: "text", nullable: false },
    reason: { type: "text", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "availability_overrides_date_idx", columns: ["date"] },
  ],
  checks: [
    "type in ('closed', 'open_override', 'partial_day', 'manual_block')",
  ],
} as const;
