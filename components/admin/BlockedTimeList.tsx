"use client";

import { AvailabilityOverrideCard } from "./AvailabilityOverrideCard";
import type { AdminAvailabilityData } from "../../lib/admin/availability";

type BlockedTimeListProps = {
  overrides: AdminAvailabilityData["upcomingOverrides"];
  onAddFullDay: () => void;
  onAddRange: () => void;
};

export function BlockedTimeList({ overrides, onAddFullDay, onAddRange }: BlockedTimeListProps) {
  return (
    <section className="blocked-time-card" aria-labelledby="blocked-time-title">
      <div className="availability-card__header">
        <p className="eyebrow">Blocked time</p>
        <h2 id="blocked-time-title">Blocked time and days off</h2>
        <p>Days off, holidays and time ranges remove request slots from the public booking flow.</p>
      </div>

      <div className="blocked-time-card__actions">
        <button className="ghost-button" type="button" onClick={onAddFullDay}>
          Block full day
        </button>
        <button className="ghost-button" type="button" onClick={onAddRange}>
          Block time range
        </button>
      </div>

      {overrides.length > 0 ? (
        <div className="blocked-time-list">
          {overrides.map((override) => (
            <AvailabilityOverrideCard key={override.id} override={override} />
          ))}
        </div>
      ) : (
        <div className="availability-empty-state">
          <strong>No blocked time added.</strong>
          <p>Days off, holidays and time ranges will appear here.</p>
        </div>
      )}
    </section>
  );
}
