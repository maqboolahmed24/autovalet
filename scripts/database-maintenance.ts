import { runDatabaseMaintenance } from "../lib/db/maintenance";
import { isDatabaseConfigured } from "../lib/db/postgres";

if (!isDatabaseConfigured()) {
  console.error("DATABASE_URL is required before database maintenance can run.");
  process.exit(1);
}

try {
  const result = await runDatabaseMaintenance("manual_script");

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Database maintenance failed.");
  process.exit(1);
}
