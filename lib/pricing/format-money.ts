export function formatMoneyGBP(amountMinor: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amountMinor / 100);
}
