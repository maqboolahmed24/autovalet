import {
  createAdminSessionCookie,
  getAdminAuthStatus,
  isConfiguredAdminEmail,
  verifyAdminPassword,
} from "../../../../../lib/auth/session";

export const runtime = "nodejs";

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

function jsonResponse<TData>(body: ApiSuccessResponse<TData> | ApiErrorResponse, status = 200) {
  return Response.json(body, { status });
}

function errorResponse(code: string, message: string, status: number, details: Record<string, unknown> = {}) {
  return jsonResponse(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    status,
  );
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    const parsedBody = await request.json();
    body = parsedBody && typeof parsedBody === "object" && !Array.isArray(parsedBody)
      ? (parsedBody as Record<string, unknown>)
      : {};
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const email = readString(body.email).trim();
  const password = readString(body.password);

  if (!email || !password) {
    return errorResponse("INVALID_LOGIN", "Email and password are required.", 400);
  }

  const authStatus = getAdminAuthStatus();

  if (!authStatus.configured) {
    return errorResponse(authStatus.code, authStatus.message, 501);
  }

  if (!isConfiguredAdminEmail(email) || !verifyAdminPassword(password)) {
    return errorResponse("INVALID_LOGIN", "Email or password is incorrect.", 401);
  }

  const response = jsonResponse({
    success: true,
    data: {
      signedIn: true,
    },
    message: "Signed in.",
  });

  response.headers.set("Set-Cookie", await createAdminSessionCookie());

  return response;
}
