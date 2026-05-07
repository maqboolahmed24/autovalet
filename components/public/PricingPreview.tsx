import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

type MaintenancePrice = {
  label: string;
  price: string;
};

const maintenancePrices: MaintenancePrice[] = [
  { label: "Small", price: "£55" },
  { label: "Medium", price: "£65" },
  { label: "Large / 4x4", price: "£75" },
];

export function PricingPreview() {
  return (
    <section className="section pricing-preview" id="pricing" aria-labelledby="pricing-preview-title">
      <div className="section__inner">
        <SectionHeading
          eyebrow="Pricing"
          title="Clear pricing. Final quote confirmed on arrival."
          titleId="pricing-preview-title"
        >
          Choose your service with a clear estimate. Final price may vary depending on vehicle condition on arrival.
        </SectionHeading>

        <div className="pricing-preview__grid motion-stagger">
          <article className="premium-card price-card">
            <p className="eyebrow">Maintenance</p>

            <div className="price-card__rows" aria-label="Maintenance prices by vehicle size">
              {maintenancePrices.map((item) => (
                <div className="price-card__row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.price}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="premium-card price-card price-card--deep-clean">
            <p className="eyebrow">Deep Clean</p>
            <strong className="price-card__large-price">£160 - £170</strong>
            <p>For vehicles needing a more thorough reset.</p>
          </article>
        </div>

        <div className="pricing-preview__notice">
          <p>A deposit is required to submit a booking request. Appointments are confirmed after approval.</p>
        </div>

        <div className="pricing-preview__actions">
          <Link className="primary-button" href="/booking">
            Request a Booking
          </Link>
          <Link className="secondary-button" href="/services">
            View Full Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
