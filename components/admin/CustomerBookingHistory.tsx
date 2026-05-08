import Link from "next/link";
import type { AdminCustomerBookingHistoryItem } from "../../lib/admin/customers";

type CustomerBookingHistoryProps = {
  bookings: AdminCustomerBookingHistoryItem[];
};

function getStatusTone(status: AdminCustomerBookingHistoryItem["status"]) {
  if (status === "approved" || status === "completed" || status === "on_the_way" || status === "arrived" || status === "in_progress") {
    return "approved";
  }

  if (status === "pending_admin_review" || status === "payment_hold" || status === "reschedule_requested") {
    return "pending";
  }

  if (status === "declined" || status === "payment_failed" || status === "expired") {
    return "danger";
  }

  return "warning";
}

export function CustomerBookingHistory({ bookings }: CustomerBookingHistoryProps) {
  return (
    <section className="customer-section-card" aria-labelledby="customer-history-title">
      <div className="customer-section-card__header">
        <p className="eyebrow">Bookings</p>
        <h2 id="customer-history-title">Booking history</h2>
      </div>

      {bookings.length > 0 ? (
        <div className="customer-history">
          {bookings.map((booking) => (
            <article className="customer-history-card" key={booking.id}>
              <div className="customer-history-card__top">
                <div>
                  <strong>{booking.serviceLabel}</strong>
                  <span>{booking.dateLabel}</span>
                </div>
                <span className={`status-badge status-badge--${getStatusTone(booking.status)}`}>
                  {booking.statusLabel}
                </span>
              </div>

              <dl className="settings-inline-list">
                <div>
                  <dt>Reference</dt>
                  <dd>{booking.reference}</dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>{booking.vehicleLabel}</dd>
                </div>
                <div>
                  <dt>Estimated total</dt>
                  <dd>{booking.estimatedTotalLabel}</dd>
                </div>
                {booking.finalTotalLabel ? (
                  <div>
                    <dt>Final total</dt>
                    <dd>{booking.finalTotalLabel}</dd>
                  </div>
                ) : null}
              </dl>

              <Link className="ghost-button" href={booking.href}>
                Open booking
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="customer-section-card__empty">No booking history yet.</p>
      )}
    </section>
  );
}
