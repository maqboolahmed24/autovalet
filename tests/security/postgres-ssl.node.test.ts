import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getPostgresSslConfig } from "../../lib/db/postgres";

const savedPgSslMode = process.env.PGSSLMODE;

afterEach(() => {
  if (savedPgSslMode === undefined) {
    delete process.env.PGSSLMODE;
  } else {
    process.env.PGSSLMODE = savedPgSslMode;
  }
});

test("remote postgres connections verify TLS certificates by default", () => {
  delete process.env.PGSSLMODE;

  assert.deepEqual(getPostgresSslConfig("postgres://user:pass@db.example.com:5432/app"), {
    rejectUnauthorized: true,
  });
});

test("postgres ssl detection does not treat localhost substrings as local hosts", () => {
  delete process.env.PGSSLMODE;

  assert.deepEqual(getPostgresSslConfig("postgres://user:pass@localhost.evil.example:5432/app"), {
    rejectUnauthorized: true,
  });
});

test("local postgres connections and explicit disable keep ssl off", () => {
  delete process.env.PGSSLMODE;
  assert.equal(getPostgresSslConfig("postgres://user:pass@localhost:5432/app"), undefined);
  assert.equal(getPostgresSslConfig("postgres://user:pass@[::1]:5432/app"), undefined);

  process.env.PGSSLMODE = "disable";
  assert.equal(getPostgresSslConfig("postgres://user:pass@db.example.com:5432/app"), undefined);
});
