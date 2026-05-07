type BookingStatusTimelineItem = {
  label: string;
  description?: string;
  state?: "complete" | "current" | "pending";
};

type BookingStatusTimelineProps = {
  items: BookingStatusTimelineItem[];
};

export function BookingStatusTimeline({ items }: BookingStatusTimelineProps) {
  return (
    <ol className="booking-status-timeline" aria-label="Booking request progress">
      {items.map((item) => (
        <li className={`booking-status-timeline__item is-${item.state ?? "pending"}`} key={item.label}>
          <span className="booking-status-timeline__dot" aria-hidden="true" />
          <div>
            <strong>{item.label}</strong>
            {item.description ? <p>{item.description}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
