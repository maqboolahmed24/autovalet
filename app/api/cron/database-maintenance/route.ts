import { runDatabaseMaintenance } from "../../../../lib/db/maintenance";
import { isDatabaseConfigured } from "../../../../lib/db/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function getCronSecret() {
  return process.env.CRON_SECRET?.trim() ?? "";
}

export async function GET(request: Request) {
  const cronSecret = getCronSecret();
  const authorization = request.headers.get("authorization") ?? "";

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Cron authorization failed.",
        },
      },
      401,
    );
  }

  if (!isDatabaseConfigured()) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "DATABASE_NOT_CONFIGURED",
          message: "DATABASE_URL is required before database maintenance can run.",
        },
      },
      503,
    );
  }

  try {
    const result = await runDatabaseMaintenance("vercel_cron");

    return jsonResponse({
      success: true,
      data: result,
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "DATABASE_MAINTENANCE_FAILED",
          message: error instanceof Error ? error.message : "Database maintenance failed.",
        },
      },
      500,
    );
  }
}
