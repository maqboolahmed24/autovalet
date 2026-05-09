import {
  isWeekday,
  updateWorkingHours,
  type UpdateWorkingHoursInput,
} from "../../../../../lib/admin/availability";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";
import { isDatabaseConfigured } from "../../../../../lib/db/postgres";

export const runtime = "nodejs";

type WorkingHoursBody = {
  weekday?: unknown;
  active?: unknown;
  startTime?: unknown;
  endTime?: unknown;
};

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request, { permission: "edit_availability" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const input = toUpdateWorkingHoursInput(body.data);

  if (!input) {
    return apiError("INVALID_WORKING_HOURS_INPUT", "Working hours details are incomplete.", 400);
  }

  const result = await updateWorkingHours(input, {
    adminAuthenticated: true,
    canEditAvailability: true,
    persistenceConfigured: isDatabaseConfigured(),
  });

  if (!result.success) {
    return apiError(result.code, result.message, getAvailabilityErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Working hours updated.",
  });
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: WorkingHoursBody;
    }
  | {
      success: false;
    }
> {
  try {
    const data = await request.json();

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      data: data as WorkingHoursBody,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function toUpdateWorkingHoursInput(body: WorkingHoursBody): UpdateWorkingHoursInput | null {
  if (!isWeekday(body.weekday) || typeof body.active !== "boolean") {
    return null;
  }

  return {
    weekday: body.weekday,
    active: body.active,
    startTime: typeof body.startTime === "string" ? body.startTime : undefined,
    endTime: typeof body.endTime === "string" ? body.endTime : undefined,
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
