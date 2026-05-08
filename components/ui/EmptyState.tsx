import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
  children?: ReactNode;
};

export function EmptyState({ eyebrow = "Empty", title, description, action, children }: EmptyStateProps) {
  return (
    <section className="ui-state ui-state--empty" aria-labelledby="empty-state-title">
      <div className="ui-state__panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="empty-state-title">{title}</h1>
        <p>{description}</p>
        {children}
        {action ? (
          <div className="ui-state__actions">
            <Link className="secondary-button" href={action.href}>
              {action.label}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
