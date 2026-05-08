import { getAdminAuthStatus } from "../../../../../lib/auth/session";

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

  // TODO: Clear the secure admin session cookie and revoke the persisted session.
  return errorResponse("ADMIN_AUTH_NOT_IMPLEMENTED", "Admin sign-out is not implemented yet.", 501);
}
