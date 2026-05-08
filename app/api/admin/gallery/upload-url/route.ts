import { createGalleryUploadUrl, isMediaUploadTarget } from "../../../../../lib/media/storage";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const guard = await requireAdmin(request, { permission: "manage_gallery" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be a JSON object.", 400);
  }

  if (
    typeof body.data.filename !== "string" ||
    typeof body.data.contentType !== "string" ||
    !isMediaUploadTarget(body.data.target)
  ) {
    return apiError("INVALID_UPLOAD_REQUEST", "Upload target details are incomplete.", 400);
  }

  if (!body.data.filename.trim() || !body.data.contentType.startsWith("image/")) {
    return apiError("INVALID_UPLOAD_REQUEST", "Gallery uploads must be image files.", 400);
  }

  const result = await createGalleryUploadUrl({
    filename: body.data.filename,
    contentType: body.data.contentType,
    target: body.data.target,
  });

  if (!result.success) {
    return apiError(result.code, result.message, result.code === "MEDIA_PROVIDER_NOT_CONFIGURED" ? 501 : 400);
  }

  return Response.json({
    success: true,
    data: result,
    message: "Upload URL created.",
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
