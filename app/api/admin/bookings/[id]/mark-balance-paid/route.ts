import { isBalancePaymentMethod, markBalancePaid } from "../../../../../../lib/payments/balance";

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

type RouteContext = {
  params: {
    id: string;
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

function statusForBalancePaymentError(code: string) {
  switch (code) {
    case "ADMIN_AUTH_NOT_CONFIGURED":
    case "BOOKING_LOOKUP_NOT_CONFIGURED":
    case "BALANCE_PAYMENT_PERSISTENCE_NOT_CONFIGURED":
      return 501;
    case "ADMIN_PERMISSION_REQUIRED":
      return 403;
    case "BALANCE_PAYMENT_VALIDATION_FAILED":
      return 400;
    default:
      return 500;
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readMoneyMinor(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(numberValue) ? Math.round(numberValue) : null;
}

export async function POST(request: Request, { params }: RouteContext) {
  let body: Record<string, unknown>;

  try {
    const parsedBody = await request.json();
    body = parsedBody && typeof parsedBody === "object" && !Array.isArray(parsedBody)
      ? (parsedBody as Record<string, unknown>)
      : {};
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const amountPaidMinor = readMoneyMinor(body.amountPaidMinor);

  if (amountPaidMinor === null) {
    return errorResponse("INVALID_BALANCE_AMOUNT", "Amount paid must be an integer minor-unit amount.", 400);
  }

  if (!isBalancePaymentMethod(body.paymentMethod)) {
    return errorResponse("INVALID_PAYMENT_METHOD", "Payment method is invalid.", 400);
  }

  const result = await markBalancePaid({
    bookingId: params.id,
    amountPaidMinor,
    paymentMethod: body.paymentMethod,
    note: readString(body.note),
    paidAt: readString(body.paidAt) || undefined,
    adminId: "auth-not-configured",
  });

  if (!result.success) {
    return errorResponse(result.code, result.message, statusForBalancePaymentError(result.code));
  }

  return jsonResponse({
    success: true,
    data: {
      bookingId: params.id,
      balancePaidMinor: result.balancePaidMinor,
      balanceDueMinor: result.balanceDueMinor,
      paymentStatus: result.paymentStatus,
    },
    message: "Balance payment recorded.",
  });
}
