import Link from "next/link";

type BookingStatusViewProps = {
  reference?: string;
};

export function BookingStatusView({ reference }: BookingStatusViewProps) {
  const displayReference = reference?.trim();

  return (
    <section className="booking-outcome booking-outcome--status" aria-labelledby="booking-status-title">
      <div className="section__inner booking-outcome__inner">
        <article className="premium-card booking-outcome__card booking-status-view">
          <p className="eyebrow">Booking status</p>
          <h1 id="booking-status-title">Status lookup unavailable.</h1>

          <div className="booking-status-summary" aria-label="Booking reference and status">
            {displayReference ? (
              <div>
                <span>Reference</span>
                <strong>{displayReference}</strong>
              </div>
            ) : null}
            <div>
              <span>Status</span>
              <strong className="status-badge status-badge--warning">Unavailable</strong>
            </div>
          </div>

          <div className="booking-outcome__body">
            <p>
              Online booking status is not connected yet. No payment or appointment status can be
              confirmed from this page.
            </p>
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
