import { updateBookingAdminNotes } from "../../../../../../lib/admin/booking-notes";
import { adminGuardErrorResponse, requireAdmin } from "../../../../../../lib/auth/route-guards";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

function getErrorStatus(code: string) {
  if (code === "BOOKING_NOT_FOUND") return 404;
  if (code === "BOOKING_NOTES_PERSISTENCE_FAILED") return 500;

  return 400;
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdmin(request, { permission: "view_bookings" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await request.json();
    body = parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  if (typeof body.notes !== "string") {
    return apiError("INVALID_ADMIN_NOTES", "Admin notes must be text.", 400);
  }

  const params = await context.params;
  const result = await updateBookingAdminNotes({
    bookingId: params.id,
    adminId: guard.session.adminId,
    notes: body.notes,
  });

  if (!result.success) {
    return apiError(result.code, result.message, getErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Admin notes saved.",
  });
}
