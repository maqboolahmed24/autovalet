import assert from "node:assert/strict";
import { test } from "node:test";
import { getSafeAdminRedirectPath } from "../../lib/auth/redirects";

test("admin login redirects only allow local admin paths", () => {
  assert.equal(getSafeAdminRedirectPath("/admin"), "/admin");
  assert.equal(getSafeAdminRedirectPath("/admin/requests?filter=pending#top"), "/admin/requests?filter=pending#top");
  assert.equal(getSafeAdminRedirectPath("https://example.com/admin"), "/admin");
  assert.equal(getSafeAdminRedirectPath("//example.com/admin"), "/admin");
  assert.equal(getSafeAdminRedirectPath("/admin.evil.example"), "/admin");
  assert.equal(getSafeAdminRedirectPath("/booking/status/AV-2026-ABCD"), "/admin");
});
