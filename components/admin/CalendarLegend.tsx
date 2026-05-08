import { arePaymentsEnabled } from "../../lib/config/features";

const legendItems = [
  { label: "Approved", variant: "approved" },
  { label: "Needs review", variant: "pending" },
  { label: "Travel buffer", variant: "buffer" },
  { label: "Blocked time", variant: "blocked" },
] as const;

const paymentLegendItems = [
  { label: "Payment hold", variant: "hold" },
] as const;

export function CalendarLegend() {
  const visibleLegendItems = arePaymentsEnabled()
    ? [...legendItems.slice(0, 2), ...paymentLegendItems, ...legendItems.slice(2)]
    : legendItems;

  return (
    <div className="calendar-legend" aria-label="Calendar legend">
      {visibleLegendItems.map((item) => (
        <span className={`calendar-legend__item calendar-legend__item--${item.variant}`} key={item.variant}>
          {item.label}
        </span>
      ))}
    </div>
  );
}
