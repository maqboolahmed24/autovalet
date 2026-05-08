import { addonsTable } from "./addons";
import { adminUsersTable } from "./admin-users";
import { auditLogsTable } from "./audit-logs";
import { availabilityOverridesTable, availabilityRulesTable } from "./availability";
import { bookingAddonsTable } from "./booking-addons";
import { bookingsTable } from "./bookings";
import { customerNotesTable } from "./customer-notes";
import { customersTable } from "./customers";
import { galleryItemsTable } from "./gallery";
import { notificationLogsTable } from "./notification-logs";
import { paymentsTable } from "./payments";
import { serviceZonesTable } from "./service-zones";
import { serviceVariantsTable, servicesTable } from "./services";
import { vehiclesTable } from "./vehicles";
import { webhookEventsTable } from "./webhook-events";

export * from "./addons";
export * from "./admin-users";
export * from "./audit-logs";
export * from "./availability";
export * from "./booking-addons";
export * from "./bookings";
export * from "./customer-notes";
export * from "./customers";
export * from "./gallery";
export * from "./notification-logs";
export * from "./payments";
export * from "./service-zones";
export * from "./services";
export * from "./vehicles";
export * from "./webhook-events";

export const databaseSchema = {
  customers: customersTable,
  vehicles: vehiclesTable,
  services: servicesTable,
  serviceVariants: serviceVariantsTable,
  addons: addonsTable,
  bookings: bookingsTable,
  bookingAddons: bookingAddonsTable,
  customerNotes: customerNotesTable,
  payments: paymentsTable,
  serviceZones: serviceZonesTable,
  availabilityRules: availabilityRulesTable,
  availabilityOverrides: availabilityOverridesTable,
  adminUsers: adminUsersTable,
  galleryItems: galleryItemsTable,
  notificationLogs: notificationLogsTable,
  auditLogs: auditLogsTable,
  webhookEvents: webhookEventsTable,
} as const;
