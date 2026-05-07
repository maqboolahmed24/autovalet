import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

type MaintenancePreviewRow = {
  label: string;
  price: string;
  duration: string;
};

const maintenancePreviewRows: MaintenancePreviewRow[] = [
  { label: "Small", price: "£55", duration: "60 mins" },
  { label: "Medium", price: "£65", duration: "75 mins" },
  { label: "Large / 4x4", price: "£75", duration: "90 mins" },
];

export function ServicesPreview() {
  return (
    <section className="section services-preview" aria-labelledby="services-preview-title">
      <div className="section__inner">
        <SectionHeading eyebrow="Services" title="Choose the level of care." titleId="services-preview-title">
          Maintenance cleans, deep cleans and finishing extras for vehicles that deserve proper attention.
        </SectionHeading>

        <div className="services-preview__grid motion-stagger">
          <article className="premium-card service-preview-card">
            <p className="eyebrow">Maintenance</p>
            <h3>Regular care, refined finish.</h3>

            <div className="service-preview-card__rows" aria-label="Maintenance prices and durations">
              {maintenancePreviewRows.map((row) => (
                <div className="service-preview-card__row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.price}</strong>
                  <small>{row.duration}</small>
                </div>
              ))}
            </div>

            <p className="service-preview-card__note">From 1 hour</p>
          </article>

          <article className="premium-card service-preview-card service-preview-card--featured">
            <p className="eyebrow">Deep Clean</p>
            <h3>A more complete reset.</h3>
            <p className="service-preview-card__price">£160 - £170</p>
            <p className="service-preview-card__note">
              Final price may vary depending on condition on arrival.
            </p>
          </article>
        </div>

        <div className="services-preview__actions">
          <Link className="primary-button" href="/booking">
            Request a Booking
          </Link>
          <Link className="secondary-button" href="/services">
            View Services
          </Link>
        </div>
      </div>
    </section>
  );
}
