import { Pool, type PoolClient, type QueryResultRow } from "pg";

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseNotConfiguredError";
  }
}

type GlobalWithPool = typeof globalThis & {
  __autoValetPgPool?: Pool;
};

const globalWithPool = globalThis as GlobalWithPool;

let schemaReady: Promise<void> | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() ?? "";
}

function shouldUseSsl(databaseUrl: string) {
  if (process.env.PGSSLMODE === "disable") {
    return false;
  }

  return !databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1");
}

function getPool() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new DatabaseNotConfiguredError();
  }

  if (!globalWithPool.__autoValetPgPool) {
    globalWithPool.__autoValetPgPool = new Pool({
      connectionString: databaseUrl,
      ssl: shouldUseSsl(databaseUrl)
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });
  }

  return globalWithPool.__autoValetPgPool;
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}

async function createSchema() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id text PRIMARY KEY,
      full_name text NOT NULL,
      phone text NOT NULL,
      email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id text PRIMARY KEY,
      reference text NOT NULL UNIQUE,
      idempotency_key text UNIQUE,
      customer_id text NOT NULL REFERENCES customers(id),
      status text NOT NULL,
      source text NOT NULL DEFAULT 'public_booking',
      package_id text NOT NULL,
      requested_start_at timestamptz NOT NULL,
      service_ends_at timestamptz NOT NULL,
      blocked_until timestamptz NOT NULL,
      service_duration_minutes integer NOT NULL DEFAULT 0,
      travel_buffer_minutes integer NOT NULL DEFAULT 0,
      estimated_total_minor integer NOT NULL DEFAULT 0,
      final_total_minor integer,
      deposit_due_minor integer NOT NULL DEFAULT 0,
      deposit_paid_minor integer NOT NULL DEFAULT 0,
      balance_due_minor integer NOT NULL DEFAULT 0,
      balance_paid_minor integer NOT NULL DEFAULT 0,
      currency text NOT NULL DEFAULT 'GBP',
      full_address text NOT NULL,
      postcode text NOT NULL,
      normalized_postcode text NOT NULL,
      zone_status text NOT NULL,
      vehicle_count integer NOT NULL DEFAULT 1,
      parking_available text NOT NULL,
      parking_notes text,
      access_notes text,
      extra_notes text,
      marketing_photo_consent boolean NOT NULL DEFAULT false,
      decline_reason text,
      decline_notes text,
      admin_notes text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      approved_at timestamptz,
      declined_at timestamptz
    );

    CREATE INDEX IF NOT EXISTS bookings_status_window_idx
      ON bookings (status, requested_start_at, blocked_until);
    CREATE INDEX IF NOT EXISTS bookings_created_at_idx
      ON bookings (created_at DESC);
    CREATE INDEX IF NOT EXISTS bookings_normalized_postcode_idx
      ON bookings (normalized_postcode);

    CREATE TABLE IF NOT EXISTS vehicles (
      id text PRIMARY KEY,
      booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      make text NOT NULL,
      model text NOT NULL,
      size text NOT NULL,
      is_primary boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS vehicles_booking_id_idx
      ON vehicles (booking_id);

    CREATE TABLE IF NOT EXISTS booking_addons (
      id text PRIMARY KEY,
      booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      vehicle_id text NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      addon_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS booking_addons_booking_id_idx
      ON booking_addons (booking_id);

    CREATE TABLE IF NOT EXISTS service_zones (
      id text PRIMARY KEY,
      zone_type text NOT NULL CHECK (zone_type IN ('exact_postcode', 'outward_code', 'district', 'region')),
      value text NOT NULL,
      normalized_value text NOT NULL,
      active boolean NOT NULL DEFAULT true,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE service_zones
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

    CREATE INDEX IF NOT EXISTS service_zones_zone_normalized_idx
      ON service_zones (zone_type, normalized_value);
    CREATE UNIQUE INDEX IF NOT EXISTS service_zones_active_zone_normalized_unique
      ON service_zones (zone_type, normalized_value)
      WHERE active = true;

    CREATE TABLE IF NOT EXISTS customer_notes (
      id text PRIMARY KEY,
      customer_id text NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      admin_id text,
      admin_name text,
      note text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE customer_notes
      ADD COLUMN IF NOT EXISTS admin_name text,
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

    CREATE INDEX IF NOT EXISTS customer_notes_customer_id_idx
      ON customer_notes (customer_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS customer_notes_admin_id_idx
      ON customer_notes (admin_id);
    CREATE INDEX IF NOT EXISTS customer_notes_created_at_idx
      ON customer_notes (created_at DESC);

    CREATE TABLE IF NOT EXISTS privacy_data_requests (
      id text PRIMARY KEY,
      reference text NOT NULL UNIQUE,
      full_name text NOT NULL,
      email text NOT NULL,
      phone text,
      request_type text NOT NULL CHECK (request_type IN ('access', 'deletion', 'correction', 'marketing_consent_withdrawal')),
      message text,
      status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_review', 'completed', 'rejected')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      completed_at timestamptz,
      admin_notes text
    );

    CREATE UNIQUE INDEX IF NOT EXISTS privacy_data_requests_reference_idx
      ON privacy_data_requests (reference);
    CREATE INDEX IF NOT EXISTS privacy_data_requests_status_idx
      ON privacy_data_requests (status);
    CREATE INDEX IF NOT EXISTS privacy_data_requests_created_at_idx
      ON privacy_data_requests (created_at DESC);
    CREATE INDEX IF NOT EXISTS privacy_data_requests_email_idx
      ON privacy_data_requests (email);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id text PRIMARY KEY,
      admin_id text,
      entity_type text NOT NULL,
      entity_id text NOT NULL,
      action text NOT NULL,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS audit_logs_entity_idx
      ON audit_logs (entity_type, entity_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS database_maintenance_runs (
      id text PRIMARY KEY,
      trigger_source text NOT NULL,
      started_at timestamptz NOT NULL DEFAULT now(),
      completed_at timestamptz NOT NULL DEFAULT now(),
      size_before_bytes bigint NOT NULL DEFAULT 0,
      size_after_bytes bigint NOT NULL DEFAULT 0,
      threshold_status text NOT NULL,
      cleanup_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS database_maintenance_runs_created_at_idx
      ON database_maintenance_runs (created_at DESC);
  `);
}

export async function ensureDatabaseSchema() {
  if (!schemaReady) {
    schemaReady = createSchema().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  await schemaReady;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  await ensureDatabaseSchema();

  return getPool().query<T>(text, values);
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>) {
  await ensureDatabaseSchema();

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
