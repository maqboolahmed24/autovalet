import Link from "next/link";
import { siteConfig } from "../../lib/seo/site-config";
import { SectionHeading } from "./SectionHeading";

const serviceAreaHighlights = [
  {
    title: "Rochdale based",
    text: "AUTO VALET is based in Rochdale and reviews mobile detailing requests across Greater Manchester.",
  },
  {
    title: "Town and postcode checks",
    text: "Customers can submit a postcode, town or city so the service area can be checked before approval.",
  },
  {
    title: "Nearby area review",
    text: "Locations just outside the usual area may be reviewed for three or more vehicles at the same address.",
  },
];

export function ServiceAreaPageContent() {
  return (
    <section className="section public-info-page service-area-page" aria-label="AUTO VALET service areas">
      <div className="section__inner public-info-page__stack">
        <section className="premium-card public-info-card service-area-page__intro">
          <SectionHeading
            eyebrow="Coverage"
            title="Mobile detailing across Rochdale and Greater Manchester."
            titleId="service-area-overview-title"
          >
            AUTO VALET covers the core Greater Manchester service area for maintenance cleans,
            deep cleans and finishing extras.
          </SectionHeading>

          <ul className="service-area-list" aria-label="Greater Manchester service areas">
            {siteConfig.business.serviceAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </section>

        <div className="public-info-page__grid">
          {serviceAreaHighlights.map((item) => (
            <article className="premium-card public-info-card" key={item.title}>
              <p className="eyebrow">{item.title}</p>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <aside className="premium-card public-info-card service-area-page__cta" aria-label="Service area booking">
          <div>
            <p className="eyebrow">Request a booking</p>
            <h2>Check your mobile valet location during booking.</h2>
            <p>
              Submit the service postcode, town or city with your selected package. AUTO VALET reviews
              location, access and travel time before confirming the appointment.
            </p>
          </div>

          <div className="public-info-actions">
            <Link className="primary-button" href="/booking">
              Request a Booking
            </Link>
            <Link className="secondary-button" href="/services">
              View Services
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
