import type { ReactNode } from "react";

type BookingStepShellProps = {
  eyebrow: string;
  title: string;
  titleId: string;
  description: string;
  children: ReactNode;
};

export function BookingStepShell({ eyebrow, title, titleId, description, children }: BookingStepShellProps) {
  return (
    <article className="premium-card booking-step-card" aria-labelledby={titleId}>
      <div className="booking-step-card__heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="booking-step-card__body">{children}</div>
    </article>
  );
}
