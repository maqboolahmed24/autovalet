import Link from "next/link";
import type { PublicBookingStatus } from "../../lib/booking/status-lookup";
import { RescheduleResponseActions } from "./RescheduleResponseActions";

type BookingStatusViewProps = {
  reference?: string;
  booking?: PublicBookingStatus | null;
};

function getStatusTone(status?: PublicBookingStatus["status"]) {
  if (status === "approved" || status === "completed") return "approved";
  if (status === "declined" || status === "cancelled_by_admin" || status === "cancelled_by_customer") return "danger";

  return "warning";
}

function getStatusBody(booking: PublicBookingStatus) {
  if (booking.canRespondToReschedule && booking.rescheduleProposedStartLabel) {
    return "AUTO VALET has offered a new appointment time. Accept it to confirm the booking, or let AUTO VALET know it does not work.";
  }

  if (booking.status === "approved") {
    return `${booking.serviceLabel} is confirmed for ${booking.requestedStartLabel}.`;
  }

  return `${booking.serviceLabel} requested for ${booking.requestedStartLabel}. Admin review is required before any appointment is confirmed.`;
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
            {booking?.rescheduleProposedStartLabel ? (
              <div>
                <span>Suggested time</span>
                <strong>{booking.rescheduleProposedStartLabel}</strong>
              </div>
            ) : null}
          </div>

          <div className="booking-outcome__body">
            {booking ? (
              <>
                <p>{getStatusBody(booking)}</p>
                {booking.canRespondToReschedule && booking.rescheduleProposedStartLabel ? (
                  <div className="booking-reschedule-offer">
                    <div>
                      <span>Original request</span>
                      <strong>{booking.requestedStartLabel}</strong>
                    </div>
                    <div>
                      <span>New offer</span>
                      <strong>{booking.rescheduleProposedStartLabel}</strong>
                    </div>
                    {booking.rescheduleMessage ? <p>{booking.rescheduleMessage}</p> : null}
                  </div>
                ) : null}
              </>
            ) : (
              <p>Check the reference or contact AUTO VALET if you need help with a booking request.</p>
            )}
          </div>

          {booking?.canRespondToReschedule && displayReference ? (
            <RescheduleResponseActions reference={displayReference} />
          ) : (
            <div className="booking-outcome__actions">
              <Link className="primary-button" href="/booking">
                Request another booking
              </Link>
              <Link className="secondary-button" href="/">
                Back to home
              </Link>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
