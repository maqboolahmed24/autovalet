"use client";

import { WorkingHoursDayRow } from "./WorkingHoursDayRow";
import type { AdminAvailabilityData } from "../../lib/admin/availability";

type WorkingHoursCardProps = {
  workingHours: AdminAvailabilityData["workingHours"];
  onEdit: (day: AdminAvailabilityData["workingHours"][number]) => void;
};

export function WorkingHoursCard({ workingHours, onEdit }: WorkingHoursCardProps) {
  return (
    <section className="working-hours-card" aria-labelledby="working-hours-title">
      <div className="availability-card__header">
        <p className="eyebrow">Working hours</p>
        <h2 id="working-hours-title">Default weekly hours</h2>
        <p>Customers can request times only where the service fits inside these hours.</p>
      </div>

      <div className="working-hours-card__rows">
        {workingHours.map((day) => (
          <WorkingHoursDayRow day={day} key={day.weekday} onEdit={() => onEdit(day)} />
        ))}
      </div>
    </section>
  );
}
