import {
  isPackageId,
  isVehicleSize,
  updateServiceVariant,
  type UpdateServiceVariantInput,
} from "../../../../../lib/admin/services-pricing";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type ServicePricingBody = {
  active?: unknown;
  variants?: unknown;
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

  if (!isPackageId(params.id)) {
    return apiError("INVALID_SERVICE_ID", "Choose a valid service package.", 400);
  }

  const input = toUpdateServiceVariantInput(params.id, body.data);

  if (!input) {
    return apiError("INVALID_SERVICE_PRICING_INPUT", "Service pricing details are incomplete.", 400);
  }

  const result = await updateServiceVariant(input, {
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
    message: "Service pricing updated.",
  });
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: ServicePricingBody;
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
      data: data as ServicePricingBody,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function toUpdateServiceVariantInput(
  serviceId: UpdateServiceVariantInput["serviceId"],
  body: ServicePricingBody,
): UpdateServiceVariantInput | null {
  if (!Array.isArray(body.variants)) {
    return null;
  }

  const variants = body.variants.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return null;
    }

    const record = item as Record<string, unknown>;
    const priceMinor = readMoneyMinor(record.priceMinor);
    const durationMinutes = readInteger(record.durationMinutes);

    if (!isVehicleSize(record.vehicleSize) || priceMinor === null || durationMinutes === null) {
      return null;
    }

    return {
      vehicleSize: record.vehicleSize,
      priceMinor,
      durationMinutes,
    };
  });

  if (variants.some((variant) => variant === null)) {
    return null;
  }

  return {
    serviceId,
    active: typeof body.active === "boolean" ? body.active : undefined,
    variants: variants as UpdateServiceVariantInput["variants"],
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
