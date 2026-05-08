import type { AdminRole } from "./types";

export type SignedAdminSessionPayload = {
  adminId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function signSessionPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return base64UrlEncode(new Uint8Array(signature));
}

function isSignedAdminSessionPayload(value: unknown): value is SignedAdminSessionPayload {
  const record = value as Partial<SignedAdminSessionPayload>;

  return (
    Boolean(value && typeof value === "object") &&
    typeof record.adminId === "string" &&
    typeof record.email === "string" &&
    typeof record.fullName === "string" &&
    typeof record.role === "string" &&
    typeof record.exp === "number"
  );
}

export async function createSignedAdminSessionValue(payload: SignedAdminSessionPayload, secret: string) {
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await signSessionPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export async function verifySignedAdminSessionValue(value: string, secret: string) {
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await signSessionPayload(encodedPayload, secret);

  if (signature !== expectedSignature) {
    return null;
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(decoder.decode(base64UrlDecode(encodedPayload)));
  } catch {
    return null;
  }

  if (!isSignedAdminSessionPayload(parsedPayload)) {
    return null;
  }

  if (parsedPayload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return parsedPayload;
}

