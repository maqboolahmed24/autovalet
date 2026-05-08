import type { AnalyticsEventName, AnalyticsProperties } from "./events";
import { isAnalyticsEnabled, sanitizeAnalyticsPath, sanitizeAnalyticsProperties } from "./privacy";

export interface AnalyticsProvider {
  track(eventName: AnalyticsEventName, properties?: AnalyticsProperties): void;
  page(path: string): void;
}

class NoopAnalyticsProvider implements AnalyticsProvider {
  track(_eventName: AnalyticsEventName, _properties?: AnalyticsProperties): void {
    // Analytics is disabled unless a privacy-safe provider adapter is configured.
  }

  page(_path: string): void {
    // Analytics is disabled unless a privacy-safe provider adapter is configured.
  }
}

const noopProvider = new NoopAnalyticsProvider();

export function getAnalyticsProvider(): AnalyticsProvider {
  // TODO: Return a Plausible/PostHog/GA4 adapter only after cookie/consent requirements are implemented.
  return noopProvider;
}

export function trackAnalyticsEvent(eventName: AnalyticsEventName, properties?: AnalyticsProperties) {
  if (!isAnalyticsEnabled()) return;

  getAnalyticsProvider().track(eventName, sanitizeAnalyticsProperties(properties));
}

export function trackPageView(path: string) {
  if (!isAnalyticsEnabled()) return;

  getAnalyticsProvider().page(sanitizeAnalyticsPath(path));
}
