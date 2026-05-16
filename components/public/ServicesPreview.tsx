import Link from "next/link";
import {
  addonList,
  formatMoneyGBP,
  servicePackages,
} from "../../lib/pricing";
import { SectionHeading } from "./SectionHeading";

const featuredAddonLabels = addonList.slice(0, 5).map((addon) => addon.label);

export function ServicesPreview() {
  const maintenance = servicePackages.maintenance;
  const deepClean = servicePackages.deep_clean;
  const maintenanceStartingPrice = formatMoneyGBP(maintenance.variants.small.priceMinor);

  return (
    <section className="section services-preview" id="pricing" aria-labelledby="services-preview-title">
      <div className="section__inner">
        <SectionHeading eyebrow="Services & pricing" title="Choose the level of care." titleId="services-preview-title">
          Maintenance cleans, deep cleans and finishing extras in one place. Full size-based pricing stays on the services page.
        </SectionHeading>

        <div className="services-preview__grid motion-stagger">
          <article className="premium-card service-preview-card">
            <p className="eyebrow">{maintenance.label}</p>
            <h3>{maintenance.description}</h3>
            <p className="service-preview-card__copy">
              Routine mobile care for vehicles that need a clean, finished reset without heavy condition work.
            </p>
            <p className="service-preview-card__summary">
              <strong>From {maintenanceStartingPrice}</strong>
              <span>Size and duration details on the services page.</span>
            </p>
          </article>

          <article className="premium-card service-preview-card service-preview-card--featured">
            <p className="eyebrow">{deepClean.label}</p>
            <h3>{deepClean.description}</h3>
            <p className="service-preview-card__copy">
              A more complete reset for vehicles needing deeper attention across exterior, trim and cabin areas.
            </p>
            <p className="service-preview-card__summary">
              <strong>Reviewed before approval</strong>
              <span>Final quote follows vehicle size, condition and access.</span>
            </p>
          </article>

          <article className="premium-card service-preview-card service-preview-card--addons">
            <p className="eyebrow">Add-ons</p>
            <h3>Finishing extras.</h3>
            <p className="service-preview-card__copy">
              Focused treatments can be added during booking for a more complete finish.
            </p>
            <ul className="service-preview-card__chips" aria-label="Popular add-ons">
              {featuredAddonLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="services-preview__actions">
          <Link className="primary-button" href="/booking">
            Request a Booking
          </Link>
          <Link className="secondary-button" href="/services">
            View Services and Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
