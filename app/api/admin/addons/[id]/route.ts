import {
  isAddonId,
  updateAddon,
  type UpdateAddonInput,
} from "../../../../../lib/admin/services-pricing";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type AddonBody = {
  label?: unknown;
  priceMinor?: unknown;
  extraDurationMinutes?: unknown;
  active?: unknown;
};

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "edit_services_pricing" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const params = await context.params;

  if (!isAddonId(params.id)) {
    return apiError("INVALID_ADDON_ID", "Choose a valid add-on.", 400);
  }

  const input = toUpdateAddonInput(params.id, body.data);

  if (!input) {
    return apiError("INVALID_ADDON_INPUT", "Add-on details are incomplete.", 400);
  }

  const result = await updateAddon(input, {
    adminAuthenticated: true,
    canEditServicesPricing: true,
    persistenceConfigured: false,
  });

  if (!result.success) {
    return apiError(result.code, result.message, getServicePricingErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Add-on updated.",
  });
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: AddonBody;
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
      data: data as AddonBody,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function toUpdateAddonInput(addonId: UpdateAddonInput["addonId"], body: AddonBody): UpdateAddonInput | null {
  const priceMinor = readMoneyMinor(body.priceMinor);
  const extraDurationMinutes = readInteger(body.extraDurationMinutes);

  if (priceMinor === null || extraDurationMinutes === null) {
    return null;
  }

  return {
    addonId,
    label: typeof body.label === "string" ? body.label : undefined,
    priceMinor,
    extraDurationMinutes,
    active: typeof body.active === "boolean" ? body.active : undefined,
  };
}

function readMoneyMinor(value: unknown) {
  const numberValue = readNumericInput(value);

  return numberValue !== null && Number.isSafeInteger(numberValue) ? numberValue : null;
}

function readInteger(value: unknown) {
  const numberValue = readNumericInput(value);

  return numberValue !== null && Number.isSafeInteger(numberValue) ? numberValue : null;
}

function readNumericInput(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!/^-?\d+$/.test(normalized)) {
    return null;
  }

  const numberValue = Number(normalized);

  return Number.isSafeInteger(numberValue) ? numberValue : null;
}

function getServicePricingErrorStatus(code: string) {
  if (code === "PERSISTENCE_NOT_CONFIGURED") return 501;
  if (code === "ADMIN_AUTH_REQUIRED") return 401;
  if (code === "ADMIN_PERMISSION_REQUIRED") return 403;

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
