import type { AdminPermission, AdminRole } from "./types";

export const adminPermissions = [
  "view_dashboard",
  "view_bookings",
  "approve_booking",
  "decline_booking",
  "reschedule_booking",
  "create_manual_booking",
  "cancel_booking",
  "mark_no_show",
  "refund_payment",
  "transfer_deposit",
  "adjust_final_price",
  "mark_balance_paid",
  "edit_availability",
  "edit_service_zones",
  "edit_services_pricing",
  "edit_deposit_settings",
  "manage_gallery",
  "view_customers",
  "edit_customers",
  "manage_admin_users",
  "view_audit_logs",
] as const satisfies readonly AdminPermission[];

export const adminRoles = ["owner", "manager", "staff", "read_only"] as const satisfies readonly AdminRole[];

const ownerPermissions = adminPermissions;

const managerPermissions = adminPermissions.filter((permission) => permission !== "manage_admin_users");

const staffPermissions = [
  "view_dashboard",
  "view_bookings",
  "approve_booking",
  "decline_booking",
  "reschedule_booking",
  "create_manual_booking",
  "cancel_booking",
  "mark_no_show",
  "adjust_final_price",
  "mark_balance_paid",
  "edit_availability",
  "manage_gallery",
  "view_customers",
] as const satisfies readonly AdminPermission[];

const readOnlyPermissions = [
  "view_dashboard",
  "view_bookings",
  "view_customers",
  "view_audit_logs",
] as const satisfies readonly AdminPermission[];

export const permissionsByRole: Record<AdminRole, readonly AdminPermission[]> = {
  owner: ownerPermissions,
  manager: managerPermissions,
  staff: staffPermissions,
  read_only: readOnlyPermissions,
};

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (adminRoles as readonly string[]).includes(value);
}

export function isAdminPermission(value: unknown): value is AdminPermission {
  return typeof value === "string" && (adminPermissions as readonly string[]).includes(value);
}

export function getPermissionsForRole(role: AdminRole): AdminPermission[] {
  return [...permissionsByRole[role]];
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission): boolean {
  return permissionsByRole[role].includes(permission);
}
