import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

type AddonPreviewItem = {
  name: string;
  price: string;
};

// TODO: Replace this local preview data with the central service catalog once add-ons are implemented in lib/pricing or lib/services.
const addons: AddonPreviewItem[] = [
  { name: "Engine bay clean", price: "£30" },
  { name: "Windscreen repellent", price: "£30" },
  { name: "Exhaust tips polished", price: "£20" },
  { name: "Leather deep clean", price: "£50" },
  { name: "Convertible roof treatment", price: "£40" },
  { name: "Removal of excess pet hair", price: "£30" },
  { name: "Liquid decon and clay bar", price: "£50" },
];

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
          {addons.map((addon) => (
            <article className="addon-chip-card" key={addon.name}>
              <span>{addon.name}</span>
              <strong>{addon.price}</strong>
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
