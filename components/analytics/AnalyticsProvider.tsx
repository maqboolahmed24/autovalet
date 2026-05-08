"use client";

import type { ReactNode } from "react";

type AnalyticsProviderProps = {
  children: ReactNode;
};

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return <>{children}</>;
}
