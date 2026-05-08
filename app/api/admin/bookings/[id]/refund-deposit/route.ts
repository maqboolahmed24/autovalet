import { requireAdmin, adminGuardErrorResponse } from "../../../../../../lib/auth/route-guards";
import { arePaymentsEnabled } from "../../../../../../lib/config/features";
import { refundDeposit } from "../../../../../../lib/payments/refunds";

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
  params: Promise<{
    id: string;
  }>;
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

function statusForRefundError(code: string) {
  switch (code) {
    case "ADMIN_AUTH_NOT_CONFIGURED":
    case "REFUND_PROVIDER_NOT_CONFIGURED":
    case "REFUND_PERSISTENCE_NOT_CONFIGURED":
    case "REFUND_PROVIDER_ADAPTER_NOT_IMPLEMENTED":
      return 501;
    case "ADMIN_PERMISSION_REQUIRED":
      return 403;
    case "REFUND_VALIDATION_FAILED":
      return 400;
    default:
      return 500;
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readMoneyMinor(value: unknown) {
  const numberValue = readIntegerInput(value);

  return numberValue !== null && Number.isSafeInteger(numberValue) ? numberValue : null;
}

function readIntegerInput(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!/^-?\d+$/.test(normalized)) {
    return null;
  }

  const numberValue = Number(normalized);

  return Number.isSafeInteger(numberValue) ? numberValue : null;
}

export async function POST(request: Request, context: RouteContext) {
  if (!arePaymentsEnabled()) {
    return errorResponse("PAYMENTS_DISABLED", "Refund actions are hidden while payments are disabled.", 404);
  }

  const guard = await requireAdmin(request, { permission: "refund_payment" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  let body: Record<string, unknown>;

  try {
    const parsedBody = await request.json();
    body = parsedBody && typeof parsedBody === "object" && !Array.isArray(parsedBody)
      ? (parsedBody as Record<string, unknown>)
      : {};
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const amountMinor = readMoneyMinor(body.amountMinor);

  if (amountMinor === null) {
    return errorResponse("INVALID_REFUND_AMOUNT", "Refund amount must be an integer minor-unit amount.", 400);
  }

  const params = await context.params;
  const result = await refundDeposit({
    bookingId: params.id,
    paymentId: readString(body.paymentId) || undefined,
    amountMinor,
    reason: readString(body.reason),
    adminId: guard.session.adminId,
  }, {
    adminAuthenticated: true,
    canRefundPayment: true,
    paymentProviderConfigured: false,
    persistenceConfigured: false,
  });

  if (!result.success) {
    return errorResponse(result.code, result.message, statusForRefundError(result.code));
  }

  return jsonResponse({
    success: true,
    data: {
      bookingId: params.id,
      refundReference: result.refundReference,
      amountMinor: result.amountMinor,
      status: result.status,
    },
    message: "Deposit refund recorded.",
  });
}
