import type { ReactNode } from "react";

type PublicPageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PublicPageShell({ children, className }: PublicPageShellProps) {
  return <div className={`page-shell page-shell--public${className ? ` ${className}` : ""}`}>{children}</div>;
}

