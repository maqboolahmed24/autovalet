export const vehiclesTable = {
  name: "vehicles",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    bookingId: { name: "booking_id", type: "uuid", references: "bookings.id", nullable: false },
    make: { type: "text", nullable: false },
    model: { type: "text", nullable: false },
    size: { type: "text", nullable: false },
    notes: { type: "text", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
  },
  indexes: [
    { name: "vehicles_booking_id_idx", columns: ["booking_id"] },
  ],
  checks: [
    "size in ('small', 'medium', 'large_4x4')",
  ],
} as const;
