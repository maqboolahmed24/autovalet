import Link from "next/link";

export function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta__inner">
        <div className="premium-card final-cta__card motion-fade-up">
          <p className="eyebrow">Request a booking</p>
          <h2 id="final-cta-title">Ready when your car is.</h2>
          <p>
            Choose your service, request your preferred slot, and we'll review the booking before
            confirming.
          </p>

          <div className="final-cta__actions">
            <Link aria-describedby="final-cta-note" className="primary-button" href="/booking">
              Request a Booking
            </Link>
          </div>

          <p className="final-cta__note" id="final-cta-note">
            Requests are reviewed before approval.
          </p>
        </div>
      </div>
    </section>
  );
}
