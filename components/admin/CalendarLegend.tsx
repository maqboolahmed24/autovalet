const legendItems = [
  { label: "Approved", variant: "approved" },
  { label: "Needs review", variant: "pending" },
  { label: "Payment hold", variant: "hold" },
  { label: "Travel buffer", variant: "buffer" },
  { label: "Blocked time", variant: "blocked" },
] as const;

export function CalendarLegend() {
  return (
    <div className="calendar-legend" aria-label="Calendar legend">
      {legendItems.map((item) => (
        <span className={`calendar-legend__item calendar-legend__item--${item.variant}`} key={item.variant}>
          {item.label}
        </span>
      ))}
    </div>
  );
}
