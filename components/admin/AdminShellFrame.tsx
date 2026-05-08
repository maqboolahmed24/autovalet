"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminBottomNav } from "./AdminBottomNav";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { AdminSkipLink } from "./AdminSkipLink";

type AdminShellFrameProps = {
  authConfigured: boolean;
  children: ReactNode;
};

export function AdminShellFrame({ authConfigured, children }: AdminShellFrameProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="admin-shell admin-shell--login">
        <main id="admin-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSkipLink />
      <AdminSidebar />

      <div className="admin-shell__content">
        <AdminHeader authConfigured={authConfigured} />

        <main id="admin-main" tabIndex={-1}>
          {children}
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
