import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";

type BookingActivityLogProps = {
  activity: AdminBookingDetailData["activity"];
};

export function BookingActivityLog({ activity }: BookingActivityLogProps) {
  return (
    <section className="info-card booking-activity-log" aria-labelledby="booking-activity-title">
      <div className="info-card__header">
        <div>
          <p className="eyebrow">Activity</p>
          <h2 id="booking-activity-title">Activity log</h2>
        </div>
      </div>
      <div className="booking-activity-log__list">
        {activity.map((item) => (
          <article className="booking-activity-log__item" key={item.id}>
            <span aria-hidden="true" />
            <div>
              <strong>{item.label}</strong>
              <p>
                {item.atLabel}
                {item.actorLabel ? ` · ${item.actorLabel}` : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
