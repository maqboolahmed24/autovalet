export const fixedDepositMinor = 3000;

export function calculateDepositDue(estimatedTotalMinor: number) {
  return Math.min(fixedDepositMinor, Math.max(estimatedTotalMinor, 0));
}
