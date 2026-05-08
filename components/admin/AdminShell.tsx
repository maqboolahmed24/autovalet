import type { ReactNode } from "react";
import { AdminBottomNav } from "./AdminBottomNav";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { AdminSkipLink } from "./AdminSkipLink";
import { isAdminSessionConfigured } from "../../lib/auth/session";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <AdminSkipLink />
      <AdminSidebar />

      <div className="admin-shell__content">
        <AdminHeader authConfigured={isAdminSessionConfigured()} />

        <main id="admin-main" tabIndex={-1}>
          {children}
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
