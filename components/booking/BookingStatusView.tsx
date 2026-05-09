import Link from "next/link";
import type { PublicBookingStatus } from "../../lib/booking/status-lookup";

type BookingStatusViewProps = {
  reference?: string;
  booking?: PublicBookingStatus | null;
};

function getStatusTone(status?: PublicBookingStatus["status"]) {
  if (status === "approved" || status === "completed") return "approved";
  if (status === "declined" || status === "cancelled_by_admin" || status === "cancelled_by_customer") return "danger";

  return "warning";
}

export function BookingStatusView({ reference, booking }: BookingStatusViewProps) {
  const displayReference = booking?.reference ?? reference?.trim();

  return (
    <section className="booking-outcome booking-outcome--status" aria-labelledby="booking-status-title">
      <div className="section__inner booking-outcome__inner">
        <article className="premium-card booking-outcome__card booking-status-view">
          <p className="eyebrow">Booking status</p>
          <h1 id="booking-status-title">
            {booking ? "Booking status." : "Booking reference not found."}
          </h1>

          <div className="booking-status-summary" aria-label="Booking reference and status">
            {displayReference ? (
              <div>
                <span>Reference</span>
                <strong>{displayReference}</strong>
              </div>
            ) : null}
            <div>
              <span>Status</span>
              <strong className={`status-badge status-badge--${getStatusTone(booking?.status)}`}>
                {booking?.statusLabel ?? "Not found"}
              </strong>
            </div>
          </div>

          <div className="booking-outcome__body">
            {booking ? (
              <p>
                {booking.serviceLabel} requested for {booking.requestedStartLabel}. Admin review is
                required before any appointment is confirmed.
              </p>
            ) : (
              <p>Check the reference or contact AUTO VALET if you need help with a booking request.</p>
            )}
          </div>

          <div className="booking-outcome__actions">
            <Link className="primary-button" href="/booking">
              Request another booking
            </Link>
            <Link className="secondary-button" href="/">
              Back to home
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
