"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type StateAction =
  | {
      href: string;
      label: string;
    }
  | {
      onClick: () => void;
      label: string;
    };

type ErrorStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: StateAction;
  secondaryAction?: {
    href: string;
    label: string;
  };
  children?: ReactNode;
};

function renderAction(action: StateAction) {
  if ("href" in action) {
    return (
      <Link className="primary-button" href={action.href}>
        {action.label}
      </Link>
    );
  }

  return (
    <button className="primary-button" type="button" onClick={action.onClick}>
      {action.label}
    </button>
  );
}

export function ErrorState({
  eyebrow = "Error",
  title,
  description,
  action,
  secondaryAction,
  children,
}: ErrorStateProps) {
  return (
    <section className="ui-state ui-state--error" aria-labelledby="error-state-title">
      <div className="ui-state__panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="error-state-title">{title}</h1>
        <p>{description}</p>
        {children}
        {action || secondaryAction ? (
          <div className="ui-state__actions">
            {action ? renderAction(action) : null}
            {secondaryAction ? (
              <Link className="secondary-button" href={secondaryAction.href}>
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
