const idempotencyKeyPattern = /^[A-Za-z0-9:_-]{12,160}$/;

function randomString(length: number) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const cryptoObject = globalThis.crypto;

  if (cryptoObject?.getRandomValues) {
    const values = cryptoObject.getRandomValues(new Uint8Array(length));

    return Array.from(values, (value) => characters[value % characters.length]).join("");
  }

  return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
}

export function createIdempotencyKey(prefix = "checkout") {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject?.randomUUID) {
    return `${prefix}_${cryptoObject.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${randomString(16)}`;
}

export function normalizeIdempotencyKey(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isValidIdempotencyKey(value: unknown) {
  const normalizedValue = normalizeIdempotencyKey(value);

  return idempotencyKeyPattern.test(normalizedValue);
}
