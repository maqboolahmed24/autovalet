"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSidebarNavItems, isAdminNavItemActive } from "./adminNavigation";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar" aria-label="Admin sidebar">
      <div className="admin-sidebar__brand">
        <p className="eyebrow">AUTO VALET</p>
        <strong>Control room</strong>
        <span>Requests, calendar and operations.</span>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin desktop navigation">
        {adminSidebarNavItems.map((item) => {
          const isActive = isAdminNavItemActive(pathname, item.href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "is-active" : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
