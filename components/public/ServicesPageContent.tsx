import Link from "next/link";
import {
  addonList,
  formatMoneyGBP,
  formatServicePriceRange,
  servicePackages,
  vehicleSizeLabels,
  vehicleSizeOrder,
} from "../../lib/pricing";
import { SectionHeading } from "./SectionHeading";

type PricingRow = {
  label: string;
  price: string;
  duration?: string;
};

type DurationGuidanceItem = {
  title: string;
  text: string;
};

const maintenanceRows: PricingRow[] = vehicleSizeOrder.map((vehicleSize) => {
  const variant = servicePackages.maintenance.variants[vehicleSize];

  return {
    label: vehicleSizeLabels[vehicleSize],
    price: formatMoneyGBP(variant.priceMinor),
    duration: `${variant.durationMinutes} mins`,
  };
});

const deepCleanRows: PricingRow[] = vehicleSizeOrder.map((vehicleSize) => {
  const variant = servicePackages.deep_clean.variants[vehicleSize];

  return {
    label: vehicleSizeLabels[vehicleSize],
    price: `from ${formatMoneyGBP(variant.priceMinor)}`,
    duration: `Estimated ${variant.durationMinutes} mins`,
  };
});

const durationGuidance: DurationGuidanceItem[] = [
  {
    title: "Maintenance timing",
    text: "Maintenance clean durations are shown by vehicle size before the internal travel buffer.",
  },
  {
    title: "Deep Clean estimates",
    text: "Deep Clean durations are estimated and configurable, because condition can change the time needed.",
  },
  {
    title: "Add-on time",
    text: "Selected extras can add time to the visit and will be reviewed before approval.",
  },
];

export function ServicesPageContent() {
  return (
    <section className="section services-page" aria-label="Services and pricing">
      <div className="section__inner services-page__inner">
        <div className="services-page__grid motion-stagger">
          <article className="premium-card services-page-card" aria-labelledby="maintenance-clean-title">
            <p className="eyebrow">{servicePackages.maintenance.label}</p>
            <h2 id="maintenance-clean-title">Maintenance Clean</h2>
            <p>A refined routine clean for vehicles needing regular care.</p>

            <div className="services-page-card__rows" aria-label="Maintenance Clean pricing and durations">
              {maintenanceRows.map((row) => (
                <div className="services-page-card__row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.price}</strong>
                  <small>{row.duration}</small>
                </div>
              ))}
            </div>
          </article>

          <article
            className="premium-card services-page-card services-page-card--featured"
            aria-labelledby="deep-clean-title"
          >
            <p className="eyebrow">{servicePackages.deep_clean.label}</p>
            <h2 id="deep-clean-title">Deep Clean</h2>
            <p>A more complete reset for vehicles needing deeper attention.</p>
            <p className="services-page-card__range">
              Deep Clean pricing ranges from {formatServicePriceRange("deep_clean")} depending on vehicle size and condition.
            </p>

            <div className="services-page-card__rows" aria-label="Deep Clean pricing and estimated durations">
              {deepCleanRows.map((row) => (
                <div className="services-page-card__row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.price}</strong>
                  <small>{row.duration}</small>
                </div>
              ))}
            </div>
          </article>
        </div>

        <section className="services-page__section" aria-labelledby="services-addons-title">
          <SectionHeading eyebrow="Add-ons" title="Finishing extras." titleId="services-addons-title">
            Add focused treatments to your booking request for a more complete finish.
          </SectionHeading>

          <div className="services-page__addons motion-stagger">
            {addonList.map((addon) => (
              <article className="services-page-addon" key={addon.id}>
                <span>{addon.label}</span>
                <strong>{formatMoneyGBP(addon.priceMinor)}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="services-page__section" aria-labelledby="services-duration-title">
          <SectionHeading
            eyebrow="Duration guidance"
            title="Service time is estimated before arrival."
            titleId="services-duration-title"
          >
            Requested slots are checked using service time, selected extras and the fixed travel
            buffer.
          </SectionHeading>

          <div className="services-page__duration-grid">
            {durationGuidance.map((item) => (
              <article className="services-page-duration" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="services-page__notice" aria-labelledby="services-notice-title">
          <div>
            <h2 id="services-notice-title">Before you request a slot</h2>
            <p>
              Prices may vary depending on vehicle condition on arrival. A deposit is required to
              submit a booking request. Appointments are confirmed only after manual approval.
            </p>
          </div>

          <div className="services-page__actions">
            <Link className="primary-button" href="/booking">
              Request a Booking
            </Link>
            <Link className="secondary-button" href="/faq">
              Read FAQs
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
