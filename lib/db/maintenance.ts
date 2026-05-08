import { randomUUID } from "node:crypto";
import { dataRetentionPolicy } from "../privacy/data-retention";
import { query } from "./postgres";

const DEFAULT_FREE_LIMIT_BYTES = 500_000_000;
const DEFAULT_SOFT_LIMIT_BYTES = 450_000_000;
const DEFAULT_HARD_LIMIT_BYTES = 490_000_000;
const TOP_RELATION_LIMIT = 10;

type DatabaseSizeRow = {
  size_bytes: string | number;
  size_pretty: string;
};

type RelationSizeRow = {
  schema_name: string;
  relation_name: string;
  total_bytes: string | number;
  total_pretty: string;
};

type TableExistsRow = {
  exists: boolean;
};

type DeleteCountRow = {
  deleted_count: string | number;
};

export type DatabaseThresholdStatus = "ok" | "near_limit" | "over_hard_limit";

export type DatabaseMaintenanceCleanup = {
  table: string;
  action: string;
  deletedRows: number;
};

export type DatabaseMaintenanceResult = {
  triggerSource: string;
  startedAt: string;
  completedAt: string;
  limitBytes: number;
  softLimitBytes: number;
  hardLimitBytes: number;
  sizeBeforeBytes: number;
  sizeAfterBytes: number;
  sizeBeforePretty: string;
  sizeAfterPretty: string;
  thresholdStatus: DatabaseThresholdStatus;
  cleanup: DatabaseMaintenanceCleanup[];
  topRelations: Array<{
    schema: string;
    relation: string;
    totalBytes: number;
    totalPretty: string;
  }>;
};

type CleanupOperation = {
  table: "audit_logs" | "database_maintenance_runs" | "notification_logs" | "webhook_events";
  action: string;
  whereSql: string;
  values: unknown[];
};

function readPositiveIntegerEnv(name: string, fallback: number) {
  const raw = process.env[name]?.trim();

  if (!raw) return fallback;

  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function getLimitConfig() {
  const limitBytes = readPositiveIntegerEnv("DATABASE_FREE_TIER_LIMIT_BYTES", DEFAULT_FREE_LIMIT_BYTES);
  const softLimitBytes = readPositiveIntegerEnv(
    "DATABASE_MAINTENANCE_SOFT_LIMIT_BYTES",
    Math.min(DEFAULT_SOFT_LIMIT_BYTES, Math.floor(limitBytes * 0.9)),
  );
  const hardLimitBytes = readPositiveIntegerEnv(
    "DATABASE_MAINTENANCE_HARD_LIMIT_BYTES",
    Math.min(DEFAULT_HARD_LIMIT_BYTES, Math.floor(limitBytes * 0.98)),
  );

  return {
    limitBytes,
    softLimitBytes,
    hardLimitBytes,
  };
}

function getThresholdStatus(sizeBytes: number, hardLimitBytes: number, softLimitBytes: number) {
  if (sizeBytes >= hardLimitBytes) return "over_hard_limit";
  if (sizeBytes >= softLimitBytes) return "near_limit";

  return "ok";
}

async function getDatabaseSize() {
  const result = await query<DatabaseSizeRow>(`
    SELECT
      pg_database_size(current_database()) AS size_bytes,
      pg_size_pretty(pg_database_size(current_database())) AS size_pretty
  `);
  const row = result.rows[0];

  return {
    bytes: toNumber(row.size_bytes),
    pretty: row.size_pretty,
  };
}

async function getTopRelations() {
  const result = await query<RelationSizeRow>(
    `
      SELECT
        n.nspname AS schema_name,
        c.relname AS relation_name,
        pg_total_relation_size(c.oid) AS total_bytes,
        pg_size_pretty(pg_total_relation_size(c.oid)) AS total_pretty
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
        AND c.relkind IN ('r', 'm', 'p')
      ORDER BY pg_total_relation_size(c.oid) DESC
      LIMIT $1
    `,
    [TOP_RELATION_LIMIT],
  );

  return result.rows.map((row) => ({
    schema: row.schema_name,
    relation: row.relation_name,
    totalBytes: toNumber(row.total_bytes),
    totalPretty: row.total_pretty,
  }));
}

async function tableExists(table: string) {
  const result = await query<TableExistsRow>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [table],
  );

  return Boolean(result.rows[0]?.exists);
}

async function runCleanupOperation(operation: CleanupOperation): Promise<DatabaseMaintenanceCleanup> {
  if (!(await tableExists(operation.table))) {
    return {
      table: operation.table,
      action: "skipped_table_missing",
      deletedRows: 0,
    };
  }

  const result = await query<DeleteCountRow>(
    `
      WITH deleted AS (
        DELETE FROM ${operation.table}
        WHERE ${operation.whereSql}
        RETURNING 1
      )
      SELECT count(*) AS deleted_count
      FROM deleted
    `,
    operation.values,
  );

  return {
    table: operation.table,
    action: operation.action,
    deletedRows: toNumber(result.rows[0]?.deleted_count ?? 0),
  };
}

async function runSafeCleanup() {
  const cleanupOperations: CleanupOperation[] = [
    {
      table: "database_maintenance_runs",
      action: "delete_older_than_30_days",
      whereSql: "created_at < now() - $1::interval",
      values: ["30 days"],
    },
    {
      table: "notification_logs",
      action: `delete_older_than_${dataRetentionPolicy.notificationLogsMonths}_months`,
      whereSql: "created_at < now() - $1::interval",
      values: [`${dataRetentionPolicy.notificationLogsMonths} months`],
    },
    {
      table: "audit_logs",
      action: `delete_older_than_${dataRetentionPolicy.auditLogsMonths}_months`,
      whereSql: "created_at < now() - $1::interval",
      values: [`${dataRetentionPolicy.auditLogsMonths} months`],
    },
    {
      table: "webhook_events",
      action: "delete_older_than_90_days",
      whereSql: "created_at < now() - $1::interval",
      values: ["90 days"],
    },
  ];

  const cleanup: DatabaseMaintenanceCleanup[] = [];

  for (const operation of cleanupOperations) {
    cleanup.push(await runCleanupOperation(operation));
  }

  await query("VACUUM (ANALYZE)");

  return cleanup;
}

async function recordMaintenanceRun(result: DatabaseMaintenanceResult) {
  await query(
    `
      INSERT INTO database_maintenance_runs (
        id,
        trigger_source,
        started_at,
        completed_at,
        size_before_bytes,
        size_after_bytes,
        threshold_status,
        cleanup_summary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
    `,
    [
      randomUUID(),
      result.triggerSource,
      result.startedAt,
      result.completedAt,
      result.sizeBeforeBytes,
      result.sizeAfterBytes,
      result.thresholdStatus,
      JSON.stringify(result.cleanup),
    ],
  );
}

export async function runDatabaseMaintenance(triggerSource = "manual"): Promise<DatabaseMaintenanceResult> {
  const startedAt = new Date().toISOString();
  const limitConfig = getLimitConfig();
  const sizeBefore = await getDatabaseSize();
  const cleanup = await runSafeCleanup();
  const sizeAfter = await getDatabaseSize();
  const topRelations = await getTopRelations();
  const completedAt = new Date().toISOString();
  const thresholdStatus = getThresholdStatus(
    Math.max(sizeBefore.bytes, sizeAfter.bytes),
    limitConfig.hardLimitBytes,
    limitConfig.softLimitBytes,
  );

  const result: DatabaseMaintenanceResult = {
    triggerSource,
    startedAt,
    completedAt,
    ...limitConfig,
    sizeBeforeBytes: sizeBefore.bytes,
    sizeAfterBytes: sizeAfter.bytes,
    sizeBeforePretty: sizeBefore.pretty,
    sizeAfterPretty: sizeAfter.pretty,
    thresholdStatus,
    cleanup,
    topRelations,
  };

  await recordMaintenanceRun(result);

  return result;
}
