import Link from "next/link";
import type { AdminTimelineItem } from "../../lib/admin/calendar";

type TimelineItemProps = {
  item: AdminTimelineItem;
};

function getStatusTone(variant: AdminTimelineItem["variant"]) {
  if (variant === "approved") {
    return "approved";
  }

  if (variant === "hold" || variant === "pending") {
    return "pending";
  }

  if (variant === "blocked") {
    return "warning";
  }

  return "paid";
}

export function TimelineItem({ item }: TimelineItemProps) {
  const content = (
    <div className="timeline-item__content">
      <div className="timeline-item__header">
        <h3>{item.title}</h3>
        {item.statusLabel ? (
          <span className={`status-badge status-badge--${getStatusTone(item.variant)}`}>
            {item.statusLabel}
          </span>
        ) : null}
      </div>
      {item.subtitle ? <p>{item.subtitle}</p> : null}
      {item.type === "buffer" ? <span className="buffer-note">Travel buffer</span> : null}
      {item.type === "available" ? <span className="buffer-note">Open gap</span> : null}
    </div>
  );

  return (
    <article className={`timeline-item timeline-item--${item.variant ?? item.type}`}>
      <div className="timeline-item__time">
        <strong>{item.startLabel}</strong>
        {item.endLabel ? <span>{item.endLabel}</span> : null}
      </div>
      {item.href ? (
        <Link className="timeline-item__link" href={item.href}>
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}
