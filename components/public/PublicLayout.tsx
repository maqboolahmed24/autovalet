import type { ReactNode } from "react";
import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import { PublicPageShell } from "./PublicPageShell";
import { PublicPageTransition } from "./PublicPageTransition";
import { SkipLink } from "./SkipLink";
import { StickyBookingCTA } from "./StickyBookingCTA";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <PublicPageShell>
      <SkipLink />
      <PublicHeader />
      <PublicPageTransition>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </PublicPageTransition>
      <PublicFooter />
      <StickyBookingCTA />
    </PublicPageShell>
  );
}

