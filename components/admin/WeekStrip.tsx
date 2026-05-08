import Link from "next/link";
import type { AdminCalendarWeekDay } from "../../lib/admin/calendar";

type WeekStripProps = {
  days: AdminCalendarWeekDay[];
  selectedDate: string;
};

export function WeekStrip({ days, selectedDate }: WeekStripProps) {
  return (
    <nav className="week-strip" aria-label="Calendar week">
      {days.map((day) => (
        <Link
          aria-current={day.date === selectedDate ? "date" : undefined}
          className={`week-strip__day${day.date === selectedDate ? " is-active" : ""}`}
          href={`/admin/calendar?date=${day.date}`}
          key={day.date}
        >
          <span>{day.weekdayLabel}</span>
          <strong>{day.dayNumber}</strong>
          <small>
            {day.jobCount > 0 ? `${day.jobCount} job${day.jobCount === 1 ? "" : "s"}` : "No jobs"}
          </small>
          {day.hasPending ? <i aria-label="Needs review" /> : null}
        </Link>
      ))}
    </nav>
  );
}
