import Link from "next/link";

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type PolicyPageContentProps = {
  sections: PolicySection[];
  ctaText?: string;
};

function sectionId(title: string) {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-title`;
}

export function PolicyPageContent({ sections, ctaText }: PolicyPageContentProps) {
  return (
    <section className="section public-info-page" aria-label="Policy details">
      <div className="section__inner public-info-page__narrow">
        <article className="premium-card public-info-card policy-content">
          {sections.map((section) => {
            const titleId = sectionId(section.title);

            return (
              <section key={section.title} aria-labelledby={titleId}>
                <h2 id={titleId}>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </article>

        <aside className="premium-card public-info-card policy-page__actions" aria-label="Booking request reminder">
          <div>
            <p className="eyebrow">Booking request</p>
            <h2>Ready to continue?</h2>
            <p>{ctaText ?? "Request your preferred slot and AUTO VALET will review it before confirming."}</p>
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
