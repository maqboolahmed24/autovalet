import Link from "next/link";

export function CustomerPrivacyCard() {
  return (
    <section className="customer-section-card customer-privacy-card" aria-labelledby="customer-privacy-title">
      <div className="customer-section-card__header">
        <div>
          <p className="eyebrow">Privacy</p>
          <h2 id="customer-privacy-title">Privacy reminder</h2>
        </div>
      </div>

      <p>
        Customer contact details, addresses and vehicle notes are personal data. Use only for booking and service management.
      </p>

      <div className="settings-card-actions">
        <Link className="ghost-button" href="/policies/privacy">
          View privacy policy
        </Link>
        <Link className="ghost-button" href="/policies/data-requests">
          Data request page
        </Link>
      </div>
    </section>
  );
}
