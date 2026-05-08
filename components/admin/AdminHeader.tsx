"use client";

import { usePathname } from "next/navigation";
import { getAdminRouteLabel } from "./adminNavigation";
import { AdminSignOutButton } from "./AdminSignOutButton";

type AdminHeaderProps = {
  authConfigured: boolean;
  adminName?: string;
};

export function AdminHeader({ authConfigured, adminName }: AdminHeaderProps) {
  const pathname = usePathname();
  const pageContext = getAdminRouteLabel(pathname);

  return (
    <header className="admin-header">
      <div className="admin-header__copy">
        <p className="eyebrow">AUTO VALET</p>
        <strong>{pageContext}</strong>
        <span>{adminName ? `${adminName} signed in` : "Admin workspace"}</span>
      </div>

      <div className="admin-header__actions">
        {!authConfigured ? <span className="admin-auth-badge">Auth setup needed</span> : null}
        {authConfigured ? <AdminSignOutButton /> : null}
      </div>
    </header>
  );
}
