import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { afterEach, beforeEach, test } from "node:test";
import { POST as login } from "../../app/api/admin/auth/login/route";
import { resetAdminLoginRateLimitForTests } from "../../lib/auth/login-rate-limit";
import { getAdminAuthStatus } from "../../lib/auth/session";
import {
  createSignedAdminSessionValue,
  verifySignedAdminSessionValue,
} from "../../lib/auth/session-cookie";

const savedEnv = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
};

function sha256PasswordHash(password: string) {
  return `sha256:${createHash("sha256").update(password).digest("hex")}`;
}

function loginRequest(body: unknown, ipAddress = "203.0.113.10") {
  return new Request("http://localhost/api/admin/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ipAddress,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.ADMIN_EMAIL = "owner@example.com";
  process.env.ADMIN_PASSWORD_HASH = sha256PasswordHash("correct-password");
  process.env.ADMIN_SESSION_SECRET = "test-secret-with-enough-entropy-32";
  resetAdminLoginRateLimitForTests();
});

afterEach(() => {
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  resetAdminLoginRateLimitForTests();
});

test("admin login rate limits repeated failed attempts before password verification continues", async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await login(
      loginRequest({
        email: "owner@example.com",
        password: "wrong-password",
      }),
    );

    assert.equal(response.status, 401);
  }

  const limitedResponse = await login(
    loginRequest({
      email: "owner@example.com",
      password: "correct-password",
    }),
  );
  const body = await limitedResponse.json();

  assert.equal(limitedResponse.status, 429);
  assert.equal(limitedResponse.headers.has("Retry-After"), true);
  assert.equal(body.error.code, "TOO_MANY_LOGIN_ATTEMPTS");
});

test("admin login rate limits repeated failures for the same account across changing forwarded IPs", async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await login(
      loginRequest(
        {
          email: "owner@example.com",
          password: "wrong-password",
        },
        `203.0.113.${attempt + 20}`,
      ),
    );

    assert.equal(response.status, 401);
  }

  const limitedResponse = await login(
    loginRequest(
      {
        email: "owner@example.com",
        password: "correct-password",
      },
      "203.0.113.99",
    ),
  );
  const body = await limitedResponse.json();

  assert.equal(limitedResponse.status, 429);
  assert.equal(body.error.code, "TOO_MANY_LOGIN_ATTEMPTS");
});

test("signed admin sessions reject tampered or malformed signatures", async () => {
  const sessionValue = await createSignedAdminSessionValue(
    {
      adminId: "env-owner",
      email: "owner@example.com",
      fullName: "Owner",
      role: "owner",
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    "test-secret-with-enough-entropy-32",
  );

  assert.equal(
    (await verifySignedAdminSessionValue(sessionValue, "test-secret-with-enough-entropy-32"))?.email,
    "owner@example.com",
  );

  assert.equal(await verifySignedAdminSessionValue(`${sessionValue}extra`, "test-secret-with-enough-entropy-32"), null);
  assert.equal(await verifySignedAdminSessionValue(`${sessionValue}.extra`, "test-secret-with-enough-entropy-32"), null);
});

test("admin auth fails closed when the session secret is too short", async () => {
  process.env.ADMIN_SESSION_SECRET = "short-secret";

  const authStatus = getAdminAuthStatus();
  const response = await login(
    loginRequest({
      email: "owner@example.com",
      password: "correct-password",
    }),
  );
  const body = await response.json();

  assert.equal(authStatus.configured, false);
  assert.equal(authStatus.code, "ADMIN_AUTH_WEAK_SECRET");
  assert.equal(response.status, 501);
  assert.equal(body.error.code, "ADMIN_AUTH_WEAK_SECRET");
});
