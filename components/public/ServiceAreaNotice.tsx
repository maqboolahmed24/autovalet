import Link from "next/link";
import { siteConfig } from "../../lib/seo/site-config";
import { SectionHeading } from "./SectionHeading";

type ServiceAreaNoticeItem = {
  title: string;
  text: string;
};

const notices: ServiceAreaNoticeItem[] = [
  {
    title: "Operating region",
    text: `We operate across ${siteConfig.business.serviceAreaLabel}.`,
  },
  {
    title: "Outside-zone requests",
    text: "We may consider requests outside the usual area for 3+ vehicles at the same address.",
  },
  {
    title: "Access and parking",
    text: "Please make sure the vehicle is accessible and suitable parking is available nearby.",
  },
  {
    title: "Manual approval",
    text: "Your appointment is only confirmed once AUTO VALET approves the request.",
  },
];

export function ServiceAreaNotice() {
  return (
    <section
      className="section service-area-notice"
      aria-labelledby="service-area-notice-title"
    >
      <div className="section__inner">
        <div className="premium-card service-area-notice__card">
          <div className="service-area-notice__intro">
            <SectionHeading
              eyebrow="Before you book"
              title="Booking requests are reviewed before confirmation."
              titleId="service-area-notice-title"
            >
              Your requested slot is reviewed alongside your location, vehicle details and selected
              service before any appointment is confirmed.
            </SectionHeading>

            <aside className="service-area-notice__cta" aria-labelledby="service-area-cta-title">
              <p className="eyebrow">Request a booking</p>
              <h3 id="service-area-cta-title">Ready when your car is.</h3>
              <p>Choose your service, request your preferred slot, and we'll review it before confirming.</p>

              <div className="service-area-notice__actions">
                <Link aria-describedby="service-area-cta-note" className="primary-button" href="/booking">
                  Request a Booking
                </Link>
                <Link className="secondary-button" href="/faq">
                  Read FAQs
                </Link>
                <Link className="secondary-button" href="/service-area">
                  View Service Areas
                </Link>
              </div>

              <p className="service-area-notice__note" id="service-area-cta-note">
                Requests are reviewed before approval.
              </p>
            </aside>
          </div>

          <div className="service-area-notice__grid">
            {notices.map((notice) => (
              <article className="service-area-notice__item" key={notice.title}>
                <h3>{notice.title}</h3>
                <p>{notice.text}</p>
              </article>
            ))}
          </div>

          <ul className="service-area-notice__areas" aria-label="Greater Manchester service areas">
            {siteConfig.business.serviceAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
