import { validateServiceZone, ZoneValidationError } from "../../../lib/zones";

type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  message?: string;
};

type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
};

type ValidateZoneRequestBody = {
  postcode?: unknown;
  regionName?: unknown;
  vehicleCount?: unknown;
};

function jsonResponse<TData>(body: ApiSuccessResponse<TData> | ApiErrorResponse, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let body: ValidateZoneRequestBody;

  try {
    body = (await request.json()) as ValidateZoneRequestBody;
  } catch {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
          details: {},
        },
      },
      400,
    );
  }

  try {
    const result = validateServiceZone({
      postcode: typeof body.postcode === "string" ? body.postcode : "",
      regionName: typeof body.regionName === "string" ? body.regionName : undefined,
      vehicleCount: typeof body.vehicleCount === "number" ? body.vehicleCount : Number(body.vehicleCount ?? 0),
    });

    return jsonResponse({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof ZoneValidationError) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: {},
          },
        },
        400,
      );
    }

    return jsonResponse(
      {
        success: false,
        error: {
          code: "ZONE_VALIDATION_FAILED",
          message: "Service area could not be checked. Please try again.",
          details: {},
        },
      },
      500,
    );
  }
}
