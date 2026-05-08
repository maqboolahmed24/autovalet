import {
  addBlockedTime,
  isBlockedTimeInputType,
  type AddBlockedTimeInput,
} from "../../../../../lib/admin/availability";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

type BlockedTimeBody = {
  date?: unknown;
  type?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  reason?: unknown;
};

export async function POST(request: Request) {
  const guard = await requireAdmin(request, { permission: "edit_availability" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const input = toAddBlockedTimeInput(body.data);

  if (!input) {
    return apiError("INVALID_BLOCKED_TIME_INPUT", "Blocked time details are incomplete.", 400);
  }

  const result = await addBlockedTime(input, {
    adminAuthenticated: true,
    canEditAvailability: true,
    persistenceConfigured: false,
  });

  if (!result.success) {
    return apiError(result.code, result.message, getAvailabilityErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Blocked time added.",
  });
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: BlockedTimeBody;
    }
  | {
      success: false;
    }
> {
  try {
    const data = (await request.json()) as BlockedTimeBody;

    return {
      success: true,
      data,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function toAddBlockedTimeInput(body: BlockedTimeBody): AddBlockedTimeInput | null {
  if (
    typeof body.date !== "string" ||
    !isBlockedTimeInputType(body.type) ||
    typeof body.reason !== "string"
  ) {
    return null;
  }

  return {
    date: body.date,
    type: body.type,
    startTime: typeof body.startTime === "string" ? body.startTime : undefined,
    endTime: typeof body.endTime === "string" ? body.endTime : undefined,
    reason: body.reason,
  };
}

function getAvailabilityErrorStatus(code: string) {
  if (code === "AVAILABILITY_PERSISTENCE_NOT_CONFIGURED") {
    return 501;
  }

  if (code === "ADMIN_AUTH_REQUIRED") {
    return 401;
  }

  if (code === "ADMIN_PERMISSION_REQUIRED") {
    return 403;
  }

  return 400;
}

function apiError(code: string, message: string, status: number) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        details: {},
      },
    },
    { status },
  );
}
