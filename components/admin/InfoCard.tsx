import type { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function InfoCard({ title, eyebrow, children, action }: InfoCardProps) {
  return (
    <section className="info-card" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, "-")}-info-title`}>
      <div className="info-card__header">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 id={`${title.toLowerCase().replace(/\s+/g, "-")}-info-title`}>{title}</h2>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="info-card__body">{children}</div>
    </section>
  );
}
