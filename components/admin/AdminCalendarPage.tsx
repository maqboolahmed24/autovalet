import { AdminPageHeader } from "./AdminPageHeader";
import { AdminSectionTitle } from "./AdminSectionTitle";
import { CalendarEmptyState } from "./CalendarEmptyState";
import { CalendarLegend } from "./CalendarLegend";
import { DayTimeline } from "./DayTimeline";
import { WeekStrip } from "./WeekStrip";
import type { AdminCalendarDay, AdminCalendarWeekDay } from "../../lib/admin/calendar";

type AdminCalendarPageProps = {
  day: AdminCalendarDay;
  weekDays: AdminCalendarWeekDay[];
  isMockData?: boolean;
};

export function AdminCalendarPage({ day, weekDays, isMockData = false }: AdminCalendarPageProps) {
  return (
    <div className="admin-page admin-calendar-page">
      <AdminPageHeader
        eyebrow="Calendar"
        title="Day timeline"
        description={
          isMockData
            ? "Placeholder timeline data while booking persistence is being connected."
            : "Approved jobs, pending requests, holds, buffers and blocked time."
        }
      />

      <section className="admin-dashboard__section" aria-labelledby="calendar-week-title">
        <AdminSectionTitle eyebrow="Week" id="calendar-week-title" title="Choose a day" />
        <WeekStrip days={weekDays} selectedDate={day.date} />
      </section>

      <section className="admin-dashboard__section" aria-labelledby="calendar-day-title">
        <AdminSectionTitle eyebrow={day.dateLabel} id="calendar-day-title" title="Selected day" />
        <div className="admin-calendar-summary" aria-label="Selected day summary">
          <div>
            <span>Approved</span>
            <strong>{day.summary.approvedCount}</strong>
          </div>
          <div>
            <span>Needs review</span>
            <strong>{day.summary.pendingCount}</strong>
          </div>
          <div>
            <span>Payment holds</span>
            <strong>{day.summary.holdCount}</strong>
          </div>
        </div>
        <CalendarLegend />
        {day.items.length > 0 ? (
          <DayTimeline items={day.items} />
        ) : (
          <CalendarEmptyState
            title="No timeline items."
            description="Bookings, buffers, blocked time and available gaps will appear here."
          />
        )}
      </section>
    </div>
  );
}
