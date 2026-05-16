import { siteConfig } from "../../lib/seo/site-config";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqGroup = {
  title: string;
  items: FaqItem[];
};

export const faqGroups: FaqGroup[] = [
  {
    title: "Booking requests",
    items: [
      {
        question: "Is my appointment confirmed when I submit the request?",
        answer:
          "No. Submitting the form sends a booking request. AUTO VALET reviews your location, vehicle details and selected service before confirming.",
      },
      {
        question: "Why do bookings need approval?",
        answer:
          "Because AUTO VALET is a mobile service. We check timing, vehicle details, service area and travel buffer before confirming.",
      },
      {
        question: "Can I request a same-day booking?",
        answer:
          "Same-day requests may not be available. The booking system can require minimum notice before a request is submitted.",
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        question: "Do I pay online when booking?",
        answer: "No. The booking form sends a request for review and no online payment is taken.",
      },
      {
        question: "How do I pay?",
        answer: "Payment is arranged after approval and paid on completion using the methods AUTO VALET accepts.",
      },
    ],
  },
  {
    title: "Pricing",
    items: [
      {
        question: "Can the final price change?",
        answer:
          "Yes. Prices may vary depending on the vehicle condition on arrival, selected extras, access and work required.",
      },
      {
        question: "What vehicle size should I choose?",
        answer:
          "Choose the closest size. AUTO VALET reviews the vehicle before approval and can adjust details if required.",
      },
    ],
  },
  {
    title: "Service area and access",
    items: [
      {
        question: "What areas do you cover?",
        answer: `AUTO VALET operates within ${siteConfig.business.operatingRegion}.`,
      },
      {
        question: "What if I am outside the usual service area?",
        answer: "Outside-zone requests may be considered for 3+ vehicles at the same address.",
      },
      {
        question: "Do I need parking?",
        answer: "Yes. Please make sure the vehicle is accessible and suitable parking is available nearby.",
      },
    ],
  },
];

export const faqSchemaItems: FaqItem[] = faqGroups.flatMap((group) => group.items);

export function FaqPageContent() {
  return (
    <section className="section public-info-page faq-page" aria-label="Frequently asked questions">
      <div className="section__inner public-info-page__stack">
        {faqGroups.map((group, groupIndex) => {
          const titleId = `faq-group-${groupIndex + 1}`;

          return (
            <section className="premium-card public-info-card faq-group" key={group.title} aria-labelledby={titleId}>
              <h2 id={titleId}>{group.title}</h2>

              <div className="faq-list">
                {group.items.map((item) => (
                  <article className="faq-item" key={item.question}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
