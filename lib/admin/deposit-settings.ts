import { fixedDepositMinor } from "../pricing/deposits";

export type DepositType = "fixed" | "percentage" | "per_vehicle";

export type DepositSettings = {
  depositType: DepositType;
  fixedAmountMinor: number;
  percentage: number;
  perVehicleAmountMinor: number;
  minimumDepositMinor: number;
  maximumDepositMinor?: number;
  transferAllowed: boolean;
  policyText: string;
};

export type DepositSettingsMutationResult =
  | {
      success: true;
      settings: DepositSettings;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type DepositSettingsMutationOptions = {
  adminAuthenticated?: boolean;
  canEditDepositSettings?: boolean;
  persistenceConfigured?: boolean;
};

export const defaultDepositSettings: DepositSettings = {
  depositType: "fixed",
  fixedAmountMinor: fixedDepositMinor,
  percentage: 20,
  perVehicleAmountMinor: fixedDepositMinor,
  minimumDepositMinor: fixedDepositMinor,
  transferAllowed: true,
  policyText: "A deposit is required to submit a booking request. Your appointment is confirmed only after approval.",
};

export async function getDepositSettings(): Promise<DepositSettings> {
  // TODO: Replace fallback settings with persisted admin deposit settings.
  return defaultDepositSettings;
}

export function calculateDepositFromSettings(input: {
  estimatedTotalMinor: number;
  vehicleCount: number;
  settings: DepositSettings;
}) {
  const estimatedTotalMinor = Number.isFinite(input.estimatedTotalMinor)
    ? Math.max(Math.round(input.estimatedTotalMinor), 0)
    : 0;

  if (estimatedTotalMinor <= 0) {
    return 0;
  }

  const vehicleCount = Number.isFinite(input.vehicleCount) ? Math.max(Math.floor(input.vehicleCount), 1) : 1;
  const baseDeposit = getBaseDeposit(input.settings, estimatedTotalMinor, vehicleCount);
  const withMinimum = Math.max(baseDeposit, input.settings.minimumDepositMinor);
  const withMaximum = typeof input.settings.maximumDepositMinor === "number"
    ? Math.min(withMinimum, input.settings.maximumDepositMinor)
    : withMinimum;

  return Math.min(Math.max(Math.round(withMaximum), 0), estimatedTotalMinor);
}

export async function updateDepositSettings(
  input: DepositSettings,
  options: DepositSettingsMutationOptions = {},
): Promise<DepositSettingsMutationResult> {
  const guard = validateDepositSettingsMutationOptions(options);

  if (guard) {
    return guard;
  }

  const validation = validateDepositSettings(input);

  if (validation) {
    return validation;
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "PERSISTENCE_NOT_CONFIGURED",
      message: "Admin-managed deposit settings are not connected to database persistence yet.",
    };
  }

  return {
    success: false,
    code: "PERSISTENCE_NOT_CONFIGURED",
    message: "Admin-managed deposit settings are not connected to database persistence yet.",
  };
}

export function isDepositType(value: unknown): value is DepositType {
  return value === "fixed" || value === "percentage" || value === "per_vehicle";
}

export function poundsToMinor(value: string) {
  const normalized = value.replace(/[£,]/g, "").trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return Math.round(numberValue * 100);
}

function getBaseDeposit(settings: DepositSettings, estimatedTotalMinor: number, vehicleCount: number) {
  if (settings.depositType === "percentage") {
    return Math.round(estimatedTotalMinor * (settings.percentage / 100));
  }

  if (settings.depositType === "per_vehicle") {
    return settings.perVehicleAmountMinor * vehicleCount;
  }

  return settings.fixedAmountMinor;
}

function validateDepositSettingsMutationOptions(
  options: DepositSettingsMutationOptions,
): Extract<DepositSettingsMutationResult, { success: false }> | null {
  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_REQUIRED",
      message: "Admin sign-in is required.",
    };
  }

  if (!options.canEditDepositSettings) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account does not have permission to edit deposit settings.",
    };
  }

  return null;
}

function validateDepositSettings(
  settings: DepositSettings,
): Extract<DepositSettingsMutationResult, { success: false }> | null {
  if (!isDepositType(settings.depositType)) {
    return {
      success: false,
      code: "INVALID_DEPOSIT_TYPE",
      message: "Choose a valid deposit type.",
    };
  }

  if (!isValidMinorAmount(settings.fixedAmountMinor)) {
    return {
      success: false,
      code: "INVALID_FIXED_DEPOSIT",
      message: "Fixed deposit must be an integer pence amount of zero or more.",
    };
  }

  if (!Number.isFinite(settings.percentage) || settings.percentage < 0 || settings.percentage > 100) {
    return {
      success: false,
      code: "INVALID_DEPOSIT_PERCENTAGE",
      message: "Deposit percentage must be between 0 and 100.",
    };
  }

  if (!isValidMinorAmount(settings.perVehicleAmountMinor)) {
    return {
      success: false,
      code: "INVALID_PER_VEHICLE_DEPOSIT",
      message: "Per-vehicle deposit must be an integer pence amount of zero or more.",
    };
  }

  if (!isValidMinorAmount(settings.minimumDepositMinor)) {
    return {
      success: false,
      code: "INVALID_MINIMUM_DEPOSIT",
      message: "Minimum deposit must be an integer pence amount of zero or more.",
    };
  }

  if (
    typeof settings.maximumDepositMinor === "number" &&
    (!isValidMinorAmount(settings.maximumDepositMinor) || settings.maximumDepositMinor < settings.minimumDepositMinor)
  ) {
    return {
      success: false,
      code: "INVALID_MAXIMUM_DEPOSIT",
      message: "Maximum deposit must be blank or greater than the minimum deposit.",
    };
  }

  return null;
}

function isValidMinorAmount(value: number) {
  return Number.isInteger(value) && Number.isFinite(value) && value >= 0;
}
