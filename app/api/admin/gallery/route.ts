import {
  createGalleryItem,
  getAdminGalleryItems,
  type AdminGalleryItemInput,
} from "../../../../lib/admin/gallery";
import { adminGuardErrorResponse, requireAdmin } from "../../../../lib/auth/route-guards";
import { isDatabaseConfigured } from "../../../../lib/db/postgres";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, { permission: "manage_gallery" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const data = await getAdminGalleryItems();

  return Response.json({
    success: true,
    data,
    message: data.isMockData
      ? "Gallery items are placeholder data until database persistence and media storage are connected."
      : undefined,
  });
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request, { permission: "manage_gallery" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be a JSON object.", 400);
  }

  const input = toGalleryItemInput(body.data);

  if (!input) {
    return apiError("INVALID_GALLERY_ITEM_INPUT", "Gallery item details are incomplete.", 400);
  }

  const result = await createGalleryItem(input, {
    adminAuthenticated: true,
    canManageGallery: true,
    persistenceConfigured: isDatabaseConfigured(),
  });

  if (!result.success) {
    return apiError(result.code, result.message, getGalleryErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Gallery item saved.",
  });
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: Record<string, unknown>;
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
      data: data as Record<string, unknown>,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function toGalleryItemInput(body: Record<string, unknown>): AdminGalleryItemInput | null {
  if (
    typeof body.title !== "string" ||
    typeof body.serviceType !== "string" ||
    typeof body.altText !== "string" ||
    typeof body.hasMarketingConsent !== "boolean" ||
    typeof body.registrationPlateChecked !== "boolean" ||
    typeof body.isFeatured !== "boolean" ||
    typeof body.active !== "boolean"
  ) {
    return null;
  }

  const displayOrder = readOptionalInteger(body.displayOrder);

  if (displayOrder === null) {
    return null;
  }

  return {
    title: body.title,
    description: typeof body.description === "string" ? body.description : undefined,
    serviceType: body.serviceType,
    vehicleType: typeof body.vehicleType === "string" ? body.vehicleType : undefined,
    beforeImageUrl: typeof body.beforeImageUrl === "string" ? body.beforeImageUrl : undefined,
    afterImageUrl: typeof body.afterImageUrl === "string" ? body.afterImageUrl : undefined,
    singleImageUrl: typeof body.singleImageUrl === "string" ? body.singleImageUrl : undefined,
    altText: body.altText,
    hasMarketingConsent: body.hasMarketingConsent,
    registrationPlateChecked: body.registrationPlateChecked,
    isFeatured: body.isFeatured,
    active: body.active,
    displayOrder,
  };
}

function readOptionalInteger(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  const numberValue = readIntegerInput(value);

  return numberValue !== null && Number.isSafeInteger(numberValue) ? numberValue : null;
}

function readIntegerInput(value: unknown) {
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

function getGalleryErrorStatus(code: string) {
  if (code === "PERSISTENCE_NOT_CONFIGURED" || code === "MEDIA_PROVIDER_NOT_CONFIGURED") return 501;
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
