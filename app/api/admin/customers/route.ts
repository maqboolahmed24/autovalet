import { getAdminCustomers } from "../../../../lib/admin/customers";
import { adminGuardErrorResponse, requireAdmin } from "../../../../lib/auth/route-guards";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, { permission: "view_customers" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const url = new URL(request.url);
  const data = await getAdminCustomers({
    search: url.searchParams.get("search") ?? undefined,
  });

  return Response.json({
    success: true,
    data,
    message: data.isMockData
      ? "Customer records are placeholder data until database persistence is connected."
      : undefined,
  });
}
