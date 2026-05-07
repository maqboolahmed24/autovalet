import Link from "next/link";
import type { ReactNode } from "react";

type BookingOutcomeVariant = "success" | "failed" | "expired" | "status";

type BookingOutcomeAction = {
  href: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
};

type BookingOutcomeCardProps = {
  variant: BookingOutcomeVariant;
  eyebrow: string;
  title: string;
  children: ReactNode;
  primaryAction?: BookingOutcomeAction;
  secondaryAction?: BookingOutcomeAction;
};

function OutcomeAction({
  action,
  className,
  describedBy,
}: {
  action: BookingOutcomeAction;
  className: string;
  describedBy: string;
}) {
  if (action.disabled) {
    return (
      <>
        <button className={className} type="button" disabled aria-describedby={describedBy}>
          {action.label}
        </button>
        {action.disabledReason ? (
          <p className="booking-outcome__action-note" id={describedBy}>
            {action.disabledReason}
          </p>
        ) : null}
      </>
    );
  }

  return (
    <Link className={className} href={action.href}>
      {action.label}
    </Link>
  );
}

export function BookingOutcomeCard({
  variant,
  eyebrow,
  title,
  children,
  primaryAction,
  secondaryAction,
}: BookingOutcomeCardProps) {
  return (
    <section className={`booking-outcome booking-outcome--${variant}`} aria-labelledby="booking-outcome-title">
      <div className="section__inner booking-outcome__inner">
        <article className="premium-card booking-outcome__card">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="booking-outcome-title">{title}</h1>
          <div className="booking-outcome__body">{children}</div>

          {primaryAction || secondaryAction ? (
            <div className="booking-outcome__actions">
              {primaryAction ? (
                <OutcomeAction
                  action={primaryAction}
                  className="primary-button"
                  describedBy="booking-outcome-primary-note"
                />
              ) : null}
              {secondaryAction ? (
                <OutcomeAction
                  action={secondaryAction}
                  className="secondary-button"
                  describedBy="booking-outcome-secondary-note"
                />
              ) : null}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
