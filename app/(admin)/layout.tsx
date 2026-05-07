import type { ReactNode } from "react";
import { AdminShell } from "../../components/admin/AdminShell";

type AdminRouteLayoutProps = {
  children: ReactNode;
};

export default function AdminRouteLayout({ children }: AdminRouteLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}
