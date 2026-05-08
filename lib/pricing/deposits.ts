export const fixedDepositMinor = 3000;

export type DepositCalculationSettings = {
  depositType: "fixed" | "percentage" | "per_vehicle";
  fixedAmountMinor: number;
  percentage: number;
  perVehicleAmountMinor: number;
  minimumDepositMinor: number;
  maximumDepositMinor?: number;
};

export function calculateDepositDue(
  estimatedTotalMinor: number,
  settings?: DepositCalculationSettings,
  vehicleCount = 1,
) {
  const normalizedTotal = Number.isFinite(estimatedTotalMinor) ? Math.max(Math.round(estimatedTotalMinor), 0) : 0;

  if (!settings) {
    return Math.min(fixedDepositMinor, normalizedTotal);
  }

  if (normalizedTotal <= 0) {
    return 0;
  }

  const normalizedVehicleCount = Number.isFinite(vehicleCount) ? Math.max(Math.floor(vehicleCount), 1) : 1;
  const baseDeposit = getBaseDeposit(settings, normalizedTotal, normalizedVehicleCount);
  const withMinimum = Math.max(baseDeposit, settings.minimumDepositMinor);
  const withMaximum = typeof settings.maximumDepositMinor === "number"
    ? Math.min(withMinimum, settings.maximumDepositMinor)
    : withMinimum;

  return Math.min(Math.max(Math.round(withMaximum), 0), normalizedTotal);
}

function getBaseDeposit(
  settings: DepositCalculationSettings,
  estimatedTotalMinor: number,
  vehicleCount: number,
) {
  if (settings.depositType === "percentage") {
    return Math.round(estimatedTotalMinor * (settings.percentage / 100));
  }

  if (settings.depositType === "per_vehicle") {
    return settings.perVehicleAmountMinor * vehicleCount;
  }

  return settings.fixedAmountMinor;
}
