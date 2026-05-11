import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createBookingReference,
  isPublicBookingReference,
} from "../../lib/booking/references";

test("new public booking references use a longer random suffix for unauthenticated lookups", () => {
  const reference = createBookingReference();

  assert.match(reference, /^AV-\d{4}-[A-Z0-9]{8}$/);
});

test("legacy four-character public booking references remain readable", () => {
  assert.equal(isPublicBookingReference("AV-2026-ABCD"), true);
  assert.equal(isPublicBookingReference("AV-2026-ABCDEFGH"), true);
});
