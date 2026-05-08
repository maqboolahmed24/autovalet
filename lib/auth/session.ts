import { getPermissionsForRole, isAdminRole } from "./permissions";
import type { AdminAuthStatus, AdminSession } from "./types";

export const adminSessionCookieName = "av_admin_session";

export type AdminUserRecord = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active?: boolean;
};

export function getAdminAuthStatus(): AdminAuthStatus {
  return {
    configured: false,
    code: "ADMIN_AUTH_NOT_CONFIGURED",
    message: "Admin authentication is not configured yet.",
  };
}

export function isAdminSessionConfigured() {
  return getAdminAuthStatus().configured;
}

export async function readAdminSession(_request: Request): Promise<AdminSession | null> {
  // TODO: Verify a secure, HTTP-only session cookie against the admin session store.
  // The foundation intentionally returns null until real persistence is connected.
  return null;
}

export function buildAdminSessionFromRecord(record: AdminUserRecord): AdminSession | null {
  if (!record.active && record.active !== undefined) {
    return null;
  }

  if (!isAdminRole(record.role)) {
    return null;
  }

  return {
    adminId: record.id,
    email: record.email,
    fullName: record.fullName,
    role: record.role,
    permissions: getPermissionsForRole(record.role),
  };
}
