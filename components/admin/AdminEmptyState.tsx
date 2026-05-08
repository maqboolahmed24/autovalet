import Link from "next/link";

type AdminEmptyStateProps = {
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
};

export function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <section className="admin-empty-state" aria-label={title}>
      <span aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? (
        <Link className="ghost-button" href={action.href}>
          {action.label}
        </Link>
      ) : null}
    </section>
  );
}
