import type { ReactNode } from "react";

type AdminSectionTitleProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  action?: ReactNode;
};

export function AdminSectionTitle({ id, eyebrow, title, action }: AdminSectionTitleProps) {
  return (
    <div className="section-title admin-section-title">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2 id={id}>{title}</h2>
      </div>
      {action ? <div className="admin-section-title__action">{action}</div> : null}
    </div>
  );
}
