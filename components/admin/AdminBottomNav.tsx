"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminMobileNavItems, isAdminNavItemActive } from "./adminNavigation";

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-bottom-nav" aria-label="Admin navigation">
      {adminMobileNavItems.map((item) => {
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
  );
}
