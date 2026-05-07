export const bookingAddonsTable = {
  name: "booking_addons",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    bookingId: { name: "booking_id", type: "uuid", references: "bookings.id", nullable: false },
    vehicleId: { name: "vehicle_id", type: "uuid", references: "vehicles.id", nullable: true },
    addonId: { name: "addon_id", type: "text", references: "addons.id", nullable: false },
    priceMinorAtBooking: { name: "price_minor_at_booking", type: "integer", nullable: false },
    durationMinutesAtBooking: { name: "duration_minutes_at_booking", type: "integer", nullable: false },
  },
  indexes: [
    { name: "booking_addons_booking_id_idx", columns: ["booking_id"] },
    { name: "booking_addons_vehicle_id_idx", columns: ["vehicle_id"] },
    { name: "booking_addons_addon_id_idx", columns: ["addon_id"] },
  ],
  checks: [
    "price_minor_at_booking >= 0",
    "duration_minutes_at_booking >= 0",
  ],
} as const;
