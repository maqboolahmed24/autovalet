import Link from "next/link";

type ContactCard = {
  title: string;
  text: string;
  meta?: string;
};

const contactCards: ContactCard[] = [
  {
    title: "Phone",
    text: "Add business phone number",
    meta: "Real phone number not supplied yet.",
  },
  {
    title: "Email",
    text: "Add business email address",
    meta: "Real email address not supplied yet.",
  },
  {
    title: "Service area guidance",
    text: "AUTO VALET operates within selected approved postcode and regional zones.",
  },
  {
    title: "Outside-zone requests",
    text: "Outside-zone requests may be considered for 3+ vehicles at the same address.",
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
              <h2>{card.text}</h2>
              {card.meta ? <p>{card.meta}</p> : null}
            </article>
          ))}
        </div>

        <aside className="premium-card public-info-card contact-page__cta" aria-label="Booking request reminder">
          <div>
            <p className="eyebrow">Booking</p>
            <h2>Ready to request a slot?</h2>
            <p>A deposit is required. AUTO VALET reviews every request before confirming the appointment.</p>
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
