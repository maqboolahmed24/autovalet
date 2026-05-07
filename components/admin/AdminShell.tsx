import type { ReactNode } from "react";
import Link from "next/link";

type AdminShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/admin", label: "Today" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/more", label: "More" },
];

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">AUTO VALET</p>
          <h1>Admin control room</h1>
          <p>Manual bookings, requests and calendar decisions in one calm workspace.</p>
        </div>
        <Link className="ghost-button admin-header__action" href="/admin/bookings/new">
          Add booking
        </Link>
      </header>

      <main id="admin-main" tabIndex={-1}>
        {children}
      </main>

      <nav className="admin-bottom-nav" aria-label="Admin navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
