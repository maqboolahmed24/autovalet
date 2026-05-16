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

function getDatabaseHostname(databaseUrl: string) {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return "";
  }
}

function shouldUseSsl(databaseUrl: string) {
  if (process.env.PGSSLMODE === "disable") {
    return false;
  }

  const hostname = getDatabaseHostname(databaseUrl);

  return hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "::1" && hostname !== "[::1]";
}

export function getPostgresSslConfig(databaseUrl: string) {
  if (!shouldUseSsl(databaseUrl)) {
    return undefined;
  }

  return {
    rejectUnauthorized: true,
  };
}

function getPool() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new DatabaseNotConfiguredError();
  }

  if (!globalWithPool.__autoValetPgPool) {
    globalWithPool.__autoValetPgPool = new Pool({
      connectionString: databaseUrl,
      ssl: getPostgresSslConfig(databaseUrl),
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
      access_to_water_available boolean NOT NULL DEFAULT false,
      access_to_electricity_available boolean NOT NULL DEFAULT false,
      accessible_parking_location boolean NOT NULL DEFAULT false,
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

    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS access_to_water_available boolean NOT NULL DEFAULT false;
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS access_to_electricity_available boolean NOT NULL DEFAULT false;
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS accessible_parking_location boolean NOT NULL DEFAULT false;

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

    CREATE TABLE IF NOT EXISTS services (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text,
      active boolean NOT NULL DEFAULT true,
      display_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS services_active_display_order_idx
      ON services (active, display_order);

    CREATE TABLE IF NOT EXISTS service_variants (
      id text PRIMARY KEY,
      service_id text NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      vehicle_size text NOT NULL CHECK (vehicle_size IN ('small', 'medium', 'large_4x4')),
      price_minor integer NOT NULL CHECK (price_minor >= 0),
      duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (service_id, vehicle_size)
    );

    CREATE INDEX IF NOT EXISTS service_variants_service_id_idx
      ON service_variants (service_id);

    CREATE TABLE IF NOT EXISTS addons (
      id text PRIMARY KEY,
      name text NOT NULL,
      price_minor integer NOT NULL CHECK (price_minor >= 0),
      extra_duration_minutes integer NOT NULL DEFAULT 0 CHECK (extra_duration_minutes >= 0),
      active boolean NOT NULL DEFAULT true,
      display_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS addons_active_display_order_idx
      ON addons (active, display_order);

    CREATE TABLE IF NOT EXISTS availability_rules (
      id text PRIMARY KEY,
      weekday integer NOT NULL CHECK (weekday BETWEEN 0 AND 6),
      start_time text NOT NULL,
      end_time text NOT NULL,
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (weekday)
    );

    CREATE INDEX IF NOT EXISTS availability_rules_weekday_active_idx
      ON availability_rules (weekday, active);

    CREATE TABLE IF NOT EXISTS availability_overrides (
      id text PRIMARY KEY,
      date date NOT NULL,
      start_time text,
      end_time text,
      type text NOT NULL CHECK (type IN ('closed_day', 'custom_hours', 'blocked_time')),
      reason text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS availability_overrides_date_idx
      ON availability_overrides (date);

    CREATE TABLE IF NOT EXISTS gallery_items (
      id text PRIMARY KEY,
      booking_id text REFERENCES bookings(id) ON DELETE SET NULL,
      title text NOT NULL,
      description text,
      service_type text NOT NULL,
      vehicle_type text,
      before_image_url text,
      after_image_url text,
      single_image_url text,
      alt_text text,
      has_marketing_consent boolean NOT NULL DEFAULT false,
      registration_plate_checked boolean NOT NULL DEFAULT false,
      is_featured boolean NOT NULL DEFAULT false,
      active boolean NOT NULL DEFAULT false,
      display_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE gallery_items
      ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS registration_plate_checked boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

    CREATE INDEX IF NOT EXISTS gallery_items_booking_id_idx
      ON gallery_items (booking_id);
    CREATE INDEX IF NOT EXISTS gallery_items_featured_active_idx
      ON gallery_items (is_featured, active);
    CREATE INDEX IF NOT EXISTS gallery_items_display_order_idx
      ON gallery_items (display_order, created_at DESC);

    CREATE TABLE IF NOT EXISTS deposit_settings (
      id text PRIMARY KEY,
      deposit_type text NOT NULL,
      fixed_amount_minor integer NOT NULL DEFAULT 0,
      percentage numeric NOT NULL DEFAULT 0,
      per_vehicle_amount_minor integer NOT NULL DEFAULT 0,
      minimum_deposit_minor integer NOT NULL DEFAULT 0,
      maximum_deposit_minor integer,
      transfer_allowed boolean NOT NULL DEFAULT true,
      policy_text text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

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

    CREATE TABLE IF NOT EXISTS payments (
      id text PRIMARY KEY,
      booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      gateway text NOT NULL,
      gateway_payment_id text,
      gateway_checkout_session_id text,
      idempotency_key text UNIQUE,
      amount_minor integer NOT NULL CHECK (amount_minor >= 0),
      currency text NOT NULL DEFAULT 'GBP' CHECK (currency = 'GBP'),
      status text NOT NULL,
      payment_type text NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'refund', 'transfer')),
      paid_at timestamptz,
      refunded_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS payments_booking_id_idx
      ON payments (booking_id);
    CREATE INDEX IF NOT EXISTS payments_gateway_payment_id_idx
      ON payments (gateway_payment_id);
    CREATE UNIQUE INDEX IF NOT EXISTS payments_idempotency_key_idx
      ON payments (idempotency_key)
      WHERE idempotency_key IS NOT NULL;

    CREATE TABLE IF NOT EXISTS notification_logs (
      id text PRIMARY KEY,
      event_type text NOT NULL,
      channel text NOT NULL CHECK (channel IN ('email', 'sms')),
      recipient_type text NOT NULL CHECK (recipient_type IN ('customer', 'admin')),
      recipient text NOT NULL,
      booking_reference text,
      provider_message_id text,
      status text NOT NULL CHECK (status IN ('sent', 'failed', 'provider_not_configured')),
      error_code text,
      error_message text,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS notification_logs_booking_reference_idx
      ON notification_logs (booking_reference);
    CREATE INDEX IF NOT EXISTS notification_logs_event_type_idx
      ON notification_logs (event_type);
    CREATE INDEX IF NOT EXISTS notification_logs_created_at_idx
      ON notification_logs (created_at DESC);

    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
      ADD COLUMN IF NOT EXISTS cancellation_actor text,
      ADD COLUMN IF NOT EXISTS cancellation_reason text,
      ADD COLUMN IF NOT EXISTS cancellation_notes text,
      ADD COLUMN IF NOT EXISTS no_show_at timestamptz,
      ADD COLUMN IF NOT EXISTS no_show_reason text,
      ADD COLUMN IF NOT EXISTS no_show_notes text,
      ADD COLUMN IF NOT EXISTS reschedule_proposed_start_at timestamptz,
      ADD COLUMN IF NOT EXISTS reschedule_message text;

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
