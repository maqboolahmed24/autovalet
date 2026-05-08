import { TimelineItem } from "./TimelineItem";
import type { AdminTimelineItem } from "../../lib/admin/calendar";

type DayTimelineProps = {
  items: AdminTimelineItem[];
};

export function DayTimeline({ items }: DayTimelineProps) {
  return (
    <div className="day-timeline" aria-label="Selected day timeline">
      {items.map((item) => (
        <TimelineItem item={item} key={item.id} />
      ))}
    </div>
  );
}
