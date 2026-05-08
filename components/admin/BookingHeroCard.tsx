import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";

type BookingHeroCardProps = {
  booking: AdminBookingDetailData;
};

function getStatusTone(status: AdminBookingDetailData["status"]) {
  if (status === "approved" || status === "on_the_way" || status === "arrived" || status === "in_progress") {
    return "approved";
  }

  if (status === "declined" || status === "payment_failed" || status === "cancelled_by_admin") {
    return "danger";
  }

  return "pending";
}

export function BookingHeroCard({ booking }: BookingHeroCardProps) {
  return (
    <section className="booking-hero-card" aria-labelledby="booking-detail-title">
      <div className="booking-hero-card__status">
        <span>{booking.reference}</span>
        <span className={`status-badge status-badge--${getStatusTone(booking.status)}`}>
          {booking.statusLabel}
        </span>
      </div>

      <h1 id="booking-detail-title">{booking.serviceLabel}</h1>

      <div className="booking-hero-card__time">
        <span>
          {booking.requestedDateLabel} at {booking.requestedTimeLabel}
        </span>
        <small>
          Service until {booking.serviceEndLabel}. Calendar blocked until {booking.blockedUntilLabel}.
        </small>
      </div>

      <div className="booking-hero-card__footer">
        <span className="payment-pill">Deposit {booking.payment.depositPaidLabel}</span>
        <span>{booking.payment.paymentStatusLabel}</span>
      </div>
    </section>
  );
}
