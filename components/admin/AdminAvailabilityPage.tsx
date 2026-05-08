"use client";

import { useMemo, useState } from "react";
import { AddBlockedTimeSheet } from "./AddBlockedTimeSheet";
import { BlockedTimeList } from "./BlockedTimeList";
import { EditWorkingHoursSheet } from "./EditWorkingHoursSheet";
import { WorkingHoursCard } from "./WorkingHoursCard";
import { AdminPageHeader } from "./AdminPageHeader";
import type { AddBlockedTimeInput, AdminAvailabilityData } from "../../lib/admin/availability";

type AdminAvailabilityPageProps = {
  data: AdminAvailabilityData;
};

export function AdminAvailabilityPage({ data }: AdminAvailabilityPageProps) {
  const [blockedTimeType, setBlockedTimeType] = useState<AddBlockedTimeInput["type"] | null>(null);
  const [editingWeekday, setEditingWeekday] = useState<AdminAvailabilityData["workingHours"][number] | null>(null);
  const firstEditableDay = useMemo(
    () => data.workingHours.find((day) => day.weekday === 1) ?? data.workingHours[0] ?? null,
    [data.workingHours],
  );

  return (
    <div className="admin-page availability-page">
      <AdminPageHeader
        eyebrow="Availability"
        title="Availability"
        description={
          data.isMockData
            ? "Default weekly hours and placeholder blocked time until persistence is connected."
            : "Manage working hours, closed days and blocked time."
        }
        actions={
          <>
            <button className="ghost-button" type="button" onClick={() => setBlockedTimeType("closed_day")}>
              Block full day
            </button>
            <button className="ghost-button" type="button" onClick={() => setBlockedTimeType("blocked_time")}>
              Block time range
            </button>
          </>
        }
      />

      <section className="availability-notice" aria-label="Availability notice">
        <strong>Availability controls which requested times customers can choose.</strong>
        <p>Approved bookings and pending requests still block the calendar separately.</p>
      </section>

      <div className="availability-page__grid">
        <div className="availability-page__main">
          <WorkingHoursCard workingHours={data.workingHours} onEdit={setEditingWeekday} />
        </div>

        <aside className="availability-page__side" aria-label="Availability actions and blocked time">
          <BlockedTimeList
            overrides={data.upcomingOverrides}
            onAddFullDay={() => setBlockedTimeType("closed_day")}
            onAddRange={() => setBlockedTimeType("blocked_time")}
          />

          <section className="availability-quick-actions" aria-labelledby="availability-quick-actions-title">
            <h2 id="availability-quick-actions-title">Quick actions</h2>
            <button className="admin-button admin-button--secondary" type="button" onClick={() => setBlockedTimeType("closed_day")}>
              Block full day
            </button>
            <button className="admin-button admin-button--secondary" type="button" onClick={() => setBlockedTimeType("blocked_time")}>
              Block time range
            </button>
            <button
              className="admin-button admin-button--secondary"
              type="button"
              disabled={!firstEditableDay}
              onClick={() => firstEditableDay ? setEditingWeekday(firstEditableDay) : null}
            >
              Edit working hours
            </button>
          </section>
        </aside>
      </div>

      {blockedTimeType ? (
        <div className="admin-sheet-backdrop" role="presentation">
          <AddBlockedTimeSheet defaultType={blockedTimeType} onClose={() => setBlockedTimeType(null)} />
        </div>
      ) : null}

      {editingWeekday ? (
        <div className="admin-sheet-backdrop" role="presentation">
          <EditWorkingHoursSheet day={editingWeekday} onClose={() => setEditingWeekday(null)} />
        </div>
      ) : null}
    </div>
  );
}
