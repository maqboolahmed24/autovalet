import { createClearAdminSessionCookie, getAdminAuthStatus } from "../../../../../lib/auth/session";

export const runtime = "nodejs";

function errorResponse(code: string, message: string, status: number, details: Record<string, unknown> = {}) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

export async function POST() {
  const authStatus = getAdminAuthStatus();

  if (!authStatus.configured) {
    return errorResponse(authStatus.code, authStatus.message, 501);
  }

  const response = Response.json({
    success: true,
    data: {
      signedOut: true,
    },
    message: "Signed out.",
  });

  response.headers.set("Set-Cookie", createClearAdminSessionCookie());

  return response;
}
