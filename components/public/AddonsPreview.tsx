import Link from "next/link";
import { addonList, formatMoneyGBP } from "../../lib/pricing";
import { SectionHeading } from "./SectionHeading";

export function AddonsPreview() {
  return (
    <section className="section addons-preview" aria-labelledby="addons-preview-title">
      <div className="section__inner">
        <SectionHeading
          eyebrow="Add-ons"
          title="Finishing extras, selected during booking."
          titleId="addons-preview-title"
        >
          Add focused treatments to your booking request for a more complete finish.
        </SectionHeading>

        <div className="addons-preview__grid motion-stagger">
          {addonList.map((addon) => (
            <article className="addon-chip-card" key={addon.id}>
              <span>{addon.label}</span>
              <strong>{formatMoneyGBP(addon.priceMinor)}</strong>
            </article>
          ))}
        </div>

        <div className="addons-preview__actions">
          <Link className="secondary-button" href="/services">
            View all services
          </Link>
          <Link className="primary-button" href="/booking">
            Request a Booking
          </Link>
        </div>
      </div>
    </section>
  );
}
