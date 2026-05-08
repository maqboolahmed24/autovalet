import { hasAdminPermission } from "./permissions";
import { getAdminAuthStatus, readAdminSession } from "./session";
import type { AdminGuardResult, RequireAdminOptions } from "./types";

export async function requireAdmin(
  request: Request,
  options: RequireAdminOptions = {},
): Promise<AdminGuardResult> {
  const authStatus = getAdminAuthStatus();

  if (!authStatus.configured) {
    return {
      success: false,
      status: 501,
      code: authStatus.code,
      message: authStatus.message,
    };
  }

  const session = await readAdminSession(request);

  if (!session) {
    return {
      success: false,
      status: 401,
      code: "UNAUTHORIZED",
      message: "Admin sign-in required.",
    };
  }

  if (options.permission && !hasAdminPermission(session.role, options.permission)) {
    return {
      success: false,
      status: 403,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account does not have permission for this action.",
    };
  }

  return {
    success: true,
    session,
  };
}

export function adminGuardErrorResponse(result: Extract<AdminGuardResult, { success: false }>) {
  return Response.json(
    {
      success: false,
      error: {
        code: result.code,
        message: result.message,
        details: {},
      },
    },
    { status: result.status },
  );
}
