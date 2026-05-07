import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

type PricingRow = {
  label: string;
  price: string;
  duration?: string;
};

type AddonRow = {
  name: string;
  price: string;
};

type DurationGuidanceItem = {
  title: string;
  text: string;
};

// TODO: Replace this public display data with the central service catalog once lib/pricing or lib/services exists.
const maintenanceRows: PricingRow[] = [
  { label: "Small", price: "£55", duration: "60 mins" },
  { label: "Medium", price: "£65", duration: "75 mins" },
  { label: "Large / 4x4", price: "£75", duration: "90 mins" },
];

const deepCleanRows: PricingRow[] = [
  { label: "Small", price: "from £160", duration: "Estimated 150 mins" },
  { label: "Medium", price: "from £165", duration: "Estimated 180 mins" },
  { label: "Large / 4x4", price: "from £170", duration: "Estimated 210 mins" },
];

const addons: AddonRow[] = [
  { name: "Engine bay clean", price: "£30" },
  { name: "Windscreen repellent", price: "£30" },
  { name: "Exhaust tips polished", price: "£20" },
  { name: "Leather deep clean", price: "£50" },
  { name: "Convertible roof treatment", price: "£40" },
  { name: "Removal of excess pet hair", price: "£30" },
  { name: "Liquid decon and clay bar", price: "£50" },
];

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
            <p className="eyebrow">Maintenance</p>
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
            <p className="eyebrow">Deep Clean</p>
            <h2 id="deep-clean-title">Deep Clean</h2>
            <p>A more complete reset for vehicles needing deeper attention.</p>
            <p className="services-page-card__range">
              Deep Clean pricing ranges from £160 - £170 depending on vehicle size and condition.
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
            {addons.map((addon) => (
              <article className="services-page-addon" key={addon.name}>
                <span>{addon.name}</span>
                <strong>{addon.price}</strong>
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
