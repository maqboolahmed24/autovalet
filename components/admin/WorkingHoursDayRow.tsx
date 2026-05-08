"use client";

import type { AdminAvailabilityData } from "../../lib/admin/availability";

type WorkingHoursDayRowProps = {
  day: AdminAvailabilityData["workingHours"][number];
  onEdit: () => void;
};

export function WorkingHoursDayRow({ day, onEdit }: WorkingHoursDayRowProps) {
  const timeLabel = day.active && day.startTime && day.endTime
    ? `${day.startTime} - ${day.endTime}`
    : "Closed";

  return (
    <div className="working-hours-row">
      <div>
        <strong>{day.weekdayLabel}</strong>
        <span>{timeLabel}</span>
      </div>
      <div>
        <span className={`availability-status availability-status--${day.active ? "active" : "closed"}`}>
          {day.active ? "Active" : "Closed"}
        </span>
        <button className="ghost-button" type="button" onClick={onEdit}>
          Edit
        </button>
      </div>
    </div>
  );
}
