import { requireAdmin, adminGuardErrorResponse } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guard = await requireAdmin(request);

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  return Response.json({
    success: true,
    data: {
      session: guard.session,
    },
  });
}
