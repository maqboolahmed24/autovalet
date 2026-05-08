import { addCustomerNote, getAdminCustomerProfile } from "../../../../../../lib/admin/customers";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../../lib/auth/route-guards";
import { isDatabaseConfigured } from "../../../../../../lib/db/postgres";

export const runtime = "nodejs";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type CustomerNoteBody = {
  note?: unknown;
};

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "edit_customers" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  if (typeof body.data.note !== "string") {
    return apiError("INVALID_CUSTOMER_NOTE_INPUT", "Customer note is required.", 400);
  }

  const params = await context.params;
  const customer = await getAdminCustomerProfile(params.id);

  if (!customer) {
    return apiError("CUSTOMER_NOT_FOUND", "Customer was not found.", 404);
  }

  const result = await addCustomerNote(
    {
      customerId: params.id,
      note: body.data.note,
      adminId: guard.session.adminId,
      adminName: guard.session.fullName,
    },
    {
      adminAuthenticated: true,
      canEditCustomers: true,
      persistenceConfigured: isDatabaseConfigured(),
    },
  );

  if (!result.success) {
    return apiError(result.code, result.message, getCustomerNoteErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Customer note saved.",
  });
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: CustomerNoteBody;
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
      data: data as CustomerNoteBody,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function getCustomerNoteErrorStatus(code: string) {
  if (code === "PERSISTENCE_NOT_CONFIGURED") return 501;
  if (code === "ADMIN_AUTH_REQUIRED") return 401;
  if (code === "ADMIN_PERMISSION_REQUIRED") return 403;
  if (code === "CUSTOMER_NOT_FOUND") return 404;

  return 400;
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
