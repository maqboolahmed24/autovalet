import type { ReactNode } from "react";

type UnavailableStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function UnavailableState({
  eyebrow = "Unavailable",
  title,
  description,
  children,
}: UnavailableStateProps) {
  return (
    <section className="ui-state ui-state--unavailable" aria-labelledby="unavailable-state-title">
      <div className="ui-state__panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="unavailable-state-title">{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </section>
  );
}
