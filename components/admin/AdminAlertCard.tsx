import Link from "next/link";
import type { AdminDashboardAlert } from "../../lib/admin/dashboard";

type AdminAlertCardProps = {
  alert: AdminDashboardAlert;
};

export function AdminAlertCard({ alert }: AdminAlertCardProps) {
  const content = (
    <>
      <strong>{alert.title}</strong>
      <p>{alert.message}</p>
    </>
  );

  if (alert.href) {
    return (
      <Link className={`admin-alert-card admin-alert-card--${alert.variant}`} href={alert.href}>
        {content}
      </Link>
    );
  }

  return <article className={`admin-alert-card admin-alert-card--${alert.variant}`}>{content}</article>;
}
