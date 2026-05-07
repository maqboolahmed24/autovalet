function randomReferenceSuffix(length: number) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const cryptoObject = globalThis.crypto;

  if (cryptoObject?.getRandomValues) {
    const values = cryptoObject.getRandomValues(new Uint8Array(length));

    return Array.from(values, (value) => characters[value % characters.length]).join("");
  }

  return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
}

export function createBookingReference(sequenceNumber?: number) {
  const year = new Date().getFullYear();

  if (typeof sequenceNumber === "number" && Number.isInteger(sequenceNumber) && sequenceNumber > 0) {
    return `AV-${year}-${String(sequenceNumber).padStart(4, "0")}`;
  }

  return `AV-${year}-${randomReferenceSuffix(4)}`;
}

export function isPublicBookingReference(value: unknown) {
  return typeof value === "string" && /^AV-\d{4}-[A-Z0-9]{4,}$/.test(value.trim());
}
