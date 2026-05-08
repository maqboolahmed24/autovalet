import type { AdminAvailabilityData } from "../../lib/admin/availability";

type AvailabilityOverrideCardProps = {
  override: AdminAvailabilityData["upcomingOverrides"][number];
};

export function AvailabilityOverrideCard({ override }: AvailabilityOverrideCardProps) {
  return (
    <article className="availability-override-card">
      <div>
        <span>{override.typeLabel}</span>
        <strong>{override.dateLabel}</strong>
        <small>{override.timeLabel}</small>
      </div>
      {override.reason ? <p>{override.reason}</p> : null}
    </article>
  );
}
