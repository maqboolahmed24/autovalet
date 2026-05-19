import Link from "next/link";
import { siteConfig } from "../../lib/seo/site-config";

type ContactCard = {
  title: string;
  text: string;
  href?: string;
  meta?: string;
  details?: {
    label: string;
    value: string;
  }[];
};

const contactCards: ContactCard[] = [
  {
    title: "Business phone number",
    text: siteConfig.business.phone,
    href: siteConfig.business.phoneHref,
  },
  {
    title: "Business Email",
    text: siteConfig.business.email,
    href: siteConfig.business.emailHref,
  },
  {
    title: "Operating Region",
    text: siteConfig.business.serviceAreaLabel,
  },
  {
    title: "Company",
    text: siteConfig.business.legalName,
    details: [
      {
        label: "Company number",
        value: siteConfig.business.companyNumber,
      },
      {
        label: "Place of Registration",
        value: siteConfig.business.placeOfRegistration,
      },
    ],
  },
  {
    title: "Registered office address",
    text: siteConfig.business.registeredOfficeAddress,
  },
  {
    title: "Access and parking",
    text: "Please make sure the vehicle is accessible and suitable parking is available nearby.",
  },
];

export function ContactPageContent() {
  return (
    <section className="section public-info-page contact-page" aria-label="AUTO VALET contact details">
      <div className="section__inner">
        <div className="public-info-page__grid motion-stagger">
          {contactCards.map((card) => (
            <article className="premium-card public-info-card contact-card" key={card.title}>
              <p className="eyebrow">{card.title}</p>
              <h2>
                {card.href ? (
                  <a className="contact-card__link" href={card.href}>
                    {card.text}
                  </a>
                ) : (
                  card.text
                )}
              </h2>
              {card.meta ? <p>{card.meta}</p> : null}
              {card.details ? (
                <dl className="contact-card__details">
                  {card.details.map((detail) => (
                    <div key={detail.label}>
                      <dt>{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          ))}
        </div>

        <aside className="premium-card public-info-card contact-page__cta" aria-label="Booking request reminder">
          <div>
            <p className="eyebrow">Booking</p>
            <h2>Ready to request a slot?</h2>
            <p>No online payment is taken. AUTO VALET reviews every request before confirming the appointment.</p>
          </div>
          <div className="public-info-actions">
            <Link className="primary-button" href="/booking">
              Request a Booking
            </Link>
            <Link className="secondary-button" href="/faq">
              Read FAQs
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
