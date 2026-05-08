import {
  getAdminServiceZones,
  isAdminServiceZoneType,
  updateServiceZone,
  type AdminServiceZoneInput,
} from "../../../../../lib/admin/service-zones";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";
import { isDatabaseConfigured } from "../../../../../lib/db/postgres";

export const runtime = "nodejs";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type ServiceZoneBody = {
  zoneType?: unknown;
  value?: unknown;
  notes?: unknown;
  active?: unknown;
};

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "edit_service_zones" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const input = toServiceZoneInput(body.data);

  if (!input) {
    return apiError("INVALID_SERVICE_ZONE_INPUT", "Service zone details are incomplete.", 400);
  }

  const params = await context.params;
  const data = await getAdminServiceZones();
  const result = await updateServiceZone(params.id, input, {
    adminAuthenticated: true,
    canEditServiceZones: true,
    persistenceConfigured: isDatabaseConfigured(),
    existingZones: data.zones,
    adminId: guard.session.adminId,
  });

  if (!result.success) {
    return apiError(result.code, result.message, getServiceZoneErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Service zone updated.",
  });
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: ServiceZoneBody;
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
      data: data as ServiceZoneBody,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function toServiceZoneInput(body: ServiceZoneBody): AdminServiceZoneInput | null {
  if (!isAdminServiceZoneType(body.zoneType) || typeof body.value !== "string") {
    return null;
  }

  return {
    zoneType: body.zoneType,
    value: body.value,
    notes: typeof body.notes === "string" ? body.notes : undefined,
    active: typeof body.active === "boolean" ? body.active : true,
  };
}

function getServiceZoneErrorStatus(code: string) {
  if (code === "PERSISTENCE_NOT_CONFIGURED") return 501;
  if (code === "ADMIN_AUTH_REQUIRED") return 401;
  if (code === "ADMIN_PERMISSION_REQUIRED") return 403;
  if (code === "DUPLICATE_ACTIVE_SERVICE_ZONE") return 409;
  if (code === "SERVICE_ZONE_NOT_FOUND") return 404;

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
