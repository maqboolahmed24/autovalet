import {
  isDepositType,
  type DepositSettings,
} from "../../../../lib/admin/deposit-settings";
import {
  getPersistedDepositSettings,
  updatePersistedDepositSettings,
} from "../../../../lib/admin/deposit-settings-persistence";
import { adminGuardErrorResponse, requireAdmin } from "../../../../lib/auth/route-guards";
import { arePaymentsEnabled } from "../../../../lib/config/features";
import { isDatabaseConfigured } from "../../../../lib/db/postgres";

export const runtime = "nodejs";

type DepositSettingsBody = Partial<Record<keyof DepositSettings, unknown>>;

export async function GET(request: Request) {
  if (!arePaymentsEnabled()) {
    return apiError("PAYMENTS_DISABLED", "Deposit settings are hidden while payments are disabled.", 404);
  }

  const guard = await requireAdmin(request, { permission: "edit_deposit_settings" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const settings = await getPersistedDepositSettings();

  return Response.json({
    success: true,
    data: {
      settings,
      isMockData: !isDatabaseConfigured(),
    },
    message: !isDatabaseConfigured()
      ? "Deposit settings are using fallback defaults because database persistence is unavailable."
      : undefined,
  });
}

export async function PATCH(request: Request) {
  if (!arePaymentsEnabled()) {
    return apiError("PAYMENTS_DISABLED", "Deposit settings are hidden while payments are disabled.", 404);
  }

  const guard = await requireAdmin(request, { permission: "edit_deposit_settings" });

  if (!guard.success) {
    return adminGuardErrorResponse(guard);
  }

  const body = await parseJson(request);

  if (!body.success) {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const input = toDepositSettings(body.data);

  if (!input) {
    return apiError("INVALID_DEPOSIT_SETTINGS_INPUT", "Deposit settings details are incomplete.", 400);
  }

  const result = await updatePersistedDepositSettings(input, {
    adminAuthenticated: true,
    canEditDepositSettings: true,
    persistenceConfigured: isDatabaseConfigured(),
  });

  if (!result.success) {
    return apiError(result.code, result.message, getDepositSettingsErrorStatus(result.code));
  }

  return Response.json({
    success: true,
    data: result,
    message: "Deposit settings updated.",
  });
}

async function parseJson(request: Request): Promise<
  | {
      success: true;
      data: DepositSettingsBody;
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
      data: data as DepositSettingsBody,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function toDepositSettings(body: DepositSettingsBody): DepositSettings | null {
  if (
    !isDepositType(body.depositType) ||
    typeof body.transferAllowed !== "boolean" ||
    typeof body.policyText !== "string"
  ) {
    return null;
  }

  const fixedAmountMinor = readMoneyMinor(body.fixedAmountMinor);
  const perVehicleAmountMinor = readMoneyMinor(body.perVehicleAmountMinor);
  const minimumDepositMinor = readMoneyMinor(body.minimumDepositMinor);
  const maximumDepositMinor = body.maximumDepositMinor === undefined
    ? undefined
    : readMoneyMinor(body.maximumDepositMinor);
  const percentage = readNumber(body.percentage);

  if (
    fixedAmountMinor === null ||
    perVehicleAmountMinor === null ||
    minimumDepositMinor === null ||
    maximumDepositMinor === null ||
    percentage === null
  ) {
    return null;
  }

  return {
    depositType: body.depositType,
    fixedAmountMinor,
    percentage,
    perVehicleAmountMinor,
    minimumDepositMinor,
    maximumDepositMinor,
    transferAllowed: body.transferAllowed,
    policyText: body.policyText,
  };
}

function readMoneyMinor(value: unknown) {
  const numberValue = readNumericInput(value, /^-?\d+$/);

  return numberValue !== null && Number.isSafeInteger(numberValue) ? numberValue : null;
}

function readNumber(value: unknown) {
  const numberValue = readNumericInput(value, /^-?(?:\d+|\d*\.\d+)$/);

  return numberValue !== null && Number.isFinite(numberValue) ? numberValue : null;
}

function readNumericInput(value: unknown, pattern: RegExp) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!pattern.test(normalized)) {
    return null;
  }

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function getDepositSettingsErrorStatus(code: string) {
  if (code === "PERSISTENCE_NOT_CONFIGURED") return 501;
  if (code === "ADMIN_AUTH_REQUIRED") return 401;
  if (code === "ADMIN_PERMISSION_REQUIRED") return 403;

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
