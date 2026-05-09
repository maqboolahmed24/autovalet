import Link from "next/link";
import {
  formatMoneyGBP,
  formatServicePriceRange,
  servicePackages,
  vehicleSizeLabels,
  vehicleSizeOrder,
} from "../../lib/pricing";
import { SectionHeading } from "./SectionHeading";

type MaintenancePrice = {
  label: string;
  price: string;
};

const maintenancePrices: MaintenancePrice[] = vehicleSizeOrder.map((vehicleSize) => ({
  label: vehicleSizeLabels[vehicleSize],
  price: formatMoneyGBP(servicePackages.maintenance.variants[vehicleSize].priceMinor),
}));

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
            <p className="eyebrow">{servicePackages.maintenance.label}</p>

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
            <p className="eyebrow">{servicePackages.deep_clean.label}</p>
            <strong className="price-card__large-price">{formatServicePriceRange("deep_clean")}</strong>
            <p>For vehicles needing a more thorough reset.</p>
          </article>
        </div>

        <div className="pricing-preview__notice">
          <p>Submit a booking request for review. Appointments are confirmed after approval.</p>
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
