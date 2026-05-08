import Link from "next/link";

const quickActions = [
  { href: "/admin/bookings/new", label: "Add manual booking" },
  { href: "/admin/requests", label: "View requests" },
  { href: "/admin/calendar", label: "Open calendar" },
  { href: "/admin/availability", label: "Block time" },
  { href: "/admin/service-zones", label: "Manage service zones" },
];

export function AdminQuickActions() {
  return (
    <div className="admin-quick-actions">
      {quickActions.map((action) => (
        <Link className="admin-quick-action" href={action.href} key={action.href}>
          {action.label}
        </Link>
      ))}
    </div>
  );
}
