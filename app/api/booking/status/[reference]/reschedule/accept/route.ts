import { acceptRescheduleOffer } from "../../../../../../../lib/booking/reschedule-response";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

function errorResponse(code: string, message: string, status: number) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

function statusForRescheduleResponseError(code: string) {
  switch (code) {
    case "INVALID_BOOKING_REFERENCE":
      return 400;
    case "BOOKING_NOT_FOUND":
      return 404;
    case "RESCHEDULE_SLOT_TAKEN":
    case "RESCHEDULE_TIME_EXPIRED":
    case "RESCHEDULE_NOT_WAITING_FOR_CUSTOMER":
      return 409;
    case "BOOKING_DATABASE_NOT_CONFIGURED":
      return 501;
    default:
      return 500;
  }
}

export async function POST(_request: Request, context: RouteContext) {
  const params = await context.params;
  const result = await acceptRescheduleOffer(decodeURIComponent(params.reference));

  if (!result.success) {
    return errorResponse(result.code, result.message, statusForRescheduleResponseError(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Suggested time accepted.",
  });
}
