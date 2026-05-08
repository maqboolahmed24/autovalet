import {
  isDataRequestType,
  submitDataRequest,
  type DataRequestInput,
} from "../../../../lib/privacy/data-requests";

export const runtime = "nodejs";

type DataRequestBody = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  requestType?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const input = toDataRequestInput(body.data);

  if (!input) {
    return apiError("INVALID_DATA_REQUEST", "Data request details are incomplete.", 400);
  }

  const result = await submitDataRequest(input);

  if (!result.success) {
    return apiError(result.code, result.message, getDataRequestErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Your request has been received.",
  });
}

function getDataRequestErrorStatus(code: string) {
  if (code === "DATA_REQUEST_STORAGE_UNAVAILABLE") return 503;
  if (code === "DATA_REQUEST_STORAGE_FAILED") return 503;

  return 400;
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: DataRequestBody;
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
      data: data as DataRequestBody,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function toDataRequestInput(body: DataRequestBody): DataRequestInput | null {
  if (
    typeof body.fullName !== "string" ||
    typeof body.email !== "string" ||
    !isDataRequestType(body.requestType)
  ) {
    return null;
  }

  return {
    fullName: body.fullName,
    email: body.email,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    requestType: body.requestType,
    message: typeof body.message === "string" ? body.message : undefined,
  };
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
