import { getAdminCustomerProfile } from "../../../../../lib/admin/customers";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "view_customers" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const params = await context.params;
  const data = await getAdminCustomerProfile(params.id);

  if (!data) {
    return Response.json(
      {
        success: false,
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: "Customer was not found.",
          details: {},
        },
      },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    data,
    message: data.isMockData
      ? "Customer profile data is placeholder until database persistence is connected."
      : undefined,
  });
}
