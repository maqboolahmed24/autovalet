export const databaseClientStatus = {
  configured: false,
  orm: "drizzle",
  provider: "postgresql",
  requiredPackages: ["drizzle-orm", "drizzle-kit", "pg"],
  requiredEnvironmentVariables: ["DATABASE_URL"],
} as const;

export type DatabaseClientStatus = typeof databaseClientStatus;

export function getDbClient(): never {
  throw new Error(
    "Database client is not configured. Install Drizzle/PostgreSQL packages and wire DATABASE_URL before using getDbClient().",
  );
}
