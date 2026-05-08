import type { ReactNode } from "react";
import { isAdminSessionConfigured } from "../../lib/auth/session";
import { AdminShellFrame } from "./AdminShellFrame";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return <AdminShellFrame authConfigured={isAdminSessionConfigured()}>{children}</AdminShellFrame>;
}
