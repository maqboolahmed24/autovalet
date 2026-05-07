import { SectionHeading } from "./SectionHeading";

type ProcessStep = {
  number: string;
  title: string;
  text: string;
};

const steps: ProcessStep[] = [
  {
    number: "01",
    title: "Choose your service",
    text: "Select your package, vehicle size and any extras.",
  },
  {
    number: "02",
    title: "Request your slot",
    text: "Pick a preferred date and time from available options.",
  },
  {
    number: "03",
    title: "Pay your deposit",
    text: "Your request is submitted securely after deposit payment.",
  },
  {
    number: "04",
    title: "We confirm",
    text: "Every booking is manually reviewed before approval.",
  },
];

export function HowItWorks() {
  return (
    <section className="section how-it-works" id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="section__inner">
        <SectionHeading eyebrow="How it works" title="A simple request process." titleId="how-it-works-title">
          Choose your service, request your preferred time, pay your deposit, and wait for approval.
        </SectionHeading>

        <ol className="how-it-works__list motion-stagger">
          {steps.map((step) => (
            <li className="premium-card how-it-works__item" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
