import { createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { getPermissionsForRole, isAdminRole } from "./permissions";
import {
  createSignedAdminSessionValue,
  verifySignedAdminSessionValue,
  type SignedAdminSessionPayload,
} from "./session-cookie";
import type { AdminAuthStatus, AdminSession } from "./types";

export const adminSessionCookieName = "av_admin_session";
export const adminSessionMaxAgeSeconds = 60 * 60 * 12;

export type AdminUserRecord = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active?: boolean;
};

function readEnvironmentVariable(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getAdminEmail() {
  return readEnvironmentVariable("ADMIN_EMAIL").toLowerCase();
}

function getAdminPasswordHash() {
  return readEnvironmentVariable("ADMIN_PASSWORD_HASH");
}

function getAdminSessionSecret() {
  return readEnvironmentVariable("ADMIN_SESSION_SECRET");
}

export function getAdminAuthStatus(): AdminAuthStatus {
  if (getAdminEmail() && getAdminPasswordHash() && getAdminSessionSecret()) {
    return {
      configured: true,
    };
  }

  return {
    configured: false,
    code: "ADMIN_AUTH_NOT_CONFIGURED",
    message: "Admin authentication requires ADMIN_EMAIL, ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET.",
  };
}

export function isAdminSessionConfigured() {
  return getAdminAuthStatus().configured;
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const prefix = `${name}=`;
  const cookie = cookies.find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : "";
}

function buildAdminSessionFromPayload(payload: SignedAdminSessionPayload): AdminSession | null {
  return buildAdminSessionFromRecord({
    id: payload.adminId,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
    active: true,
  });
}

export async function readAdminSession(request: Request): Promise<AdminSession | null> {
  const secret = getAdminSessionSecret();
  const sessionCookie = readCookie(request, adminSessionCookieName);

  if (!secret || !sessionCookie) {
    return null;
  }

  const payload = await verifySignedAdminSessionValue(sessionCookie, secret);

  return payload ? buildAdminSessionFromPayload(payload) : null;
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

function verifyScryptPassword(password: string, storedHash: string) {
  const [, salt, expectedHex] = storedHash.split(":");

  if (!salt || !expectedHex) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, expected.length);

  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

function verifySha256Password(password: string, storedHash: string) {
  const expectedHex = storedHash.slice("sha256:".length);
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"), "hex");

  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export function verifyAdminPassword(password: string) {
  const storedHash = getAdminPasswordHash();

  if (storedHash.startsWith("scrypt:")) {
    return verifyScryptPassword(password, storedHash);
  }

  if (storedHash.startsWith("sha256:")) {
    return verifySha256Password(password, storedHash);
  }

  return false;
}

export async function createAdminSessionCookie() {
  const secret = getAdminSessionSecret();
  const email = getAdminEmail();
  const fullName = readEnvironmentVariable("ADMIN_NAME") || "AUTO VALET Admin";

  if (!secret || !email) {
    throw new Error("Admin session is not configured.");
  }

  const value = await createSignedAdminSessionValue(
    {
      adminId: "env-owner",
      email,
      fullName,
      role: "owner",
      exp: Math.floor(Date.now() / 1000) + adminSessionMaxAgeSeconds,
    },
    secret,
  );

  return [
    `${adminSessionCookieName}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${adminSessionMaxAgeSeconds}`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

export function createClearAdminSessionCookie() {
  return [
    `${adminSessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

export function isConfiguredAdminEmail(value: string) {
  return value.trim().toLowerCase() === getAdminEmail();
}
