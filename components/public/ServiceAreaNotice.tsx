import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

type ServiceAreaNoticeItem = {
  title: string;
  text: string;
};

const notices: ServiceAreaNoticeItem[] = [
  {
    title: "Selected service areas",
    text: "We operate within approved postcode and regional zones.",
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
          <SectionHeading
            eyebrow="Before you book"
            title="Booking requests are reviewed before confirmation."
            titleId="service-area-notice-title"
          >
            A deposit protects your requested slot while we review your location, vehicle details
            and selected service.
          </SectionHeading>

          <div className="service-area-notice__grid">
            {notices.map((notice) => (
              <article className="service-area-notice__item" key={notice.title}>
                <h3>{notice.title}</h3>
                <p>{notice.text}</p>
              </article>
            ))}
          </div>

          <div className="service-area-notice__actions">
            <Link className="primary-button" href="/booking">
              Request a Booking
            </Link>
            <Link className="secondary-button" href="/faq">
              Read FAQs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
