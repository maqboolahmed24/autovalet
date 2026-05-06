import type { ReactNode } from "react";

type PublicPageTransitionProps = {
  children: ReactNode;
};

export function PublicPageTransition({ children }: PublicPageTransitionProps) {
  return <div className="public-page-transition motion-fade-up">{children}</div>;
}

