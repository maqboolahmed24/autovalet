import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ description, actions }: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <p>{description}</p>
      {actions ? <div className="admin-page-header__actions">{actions}</div> : null}
    </header>
  );
}
