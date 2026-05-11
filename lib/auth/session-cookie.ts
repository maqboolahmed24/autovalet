import type { AdminRole } from "./types";

export type SignedAdminSessionPayload = {
  adminId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  exp: number;
};

export const minAdminSessionSecretLength = 32;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function isAdminSessionSecretStrong(secret: string) {
  return secret.trim().length >= minAdminSessionSecretLength;
}

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

function copyToArrayBuffer(bytes: Uint8Array) {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);

  return buffer;
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

async function verifySessionPayloadSignature(payload: string, signature: string, secret: string) {
  let signatureBytes: Uint8Array;

  try {
    signatureBytes = base64UrlDecode(signature);
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify("HMAC", key, copyToArrayBuffer(signatureBytes), encoder.encode(payload));
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
  const sessionParts = value.split(".");

  if (sessionParts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = sessionParts;

  if (!encodedPayload || !signature) {
    return null;
  }

  if (!(await verifySessionPayloadSignature(encodedPayload, signature, secret))) {
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
