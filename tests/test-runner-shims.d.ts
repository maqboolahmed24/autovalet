// The repo intentionally does not install Vitest or Playwright yet.
// These ambient declarations keep TypeScript builds safe while the test files
// document the launch-critical cases. Remove this file once real runner
// packages are installed.
declare module "vitest" {
  export function describe(name: string, callback: () => void): void;
  export function it(name: string, callback: () => void | Promise<void>): void;
  export const test: typeof it;
  export function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toContain(expected: unknown): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toThrow(expected?: unknown): void;
    rejects: {
      toThrow(expected?: unknown): Promise<void>;
    };
  };
}

declare module "@playwright/test" {
  export const test: {
    (name: string, callback: (context: { page: PlaywrightPage }) => Promise<void> | void): void;
    describe(name: string, callback: () => void): void;
  };
  export const expect: (actual: unknown) => {
    toBeVisible(): Promise<void>;
    toContainText(expected: string | RegExp): Promise<void>;
    toHaveURL(expected: string | RegExp): Promise<void>;
    not: {
      toContainText(expected: string | RegExp): Promise<void>;
    };
  };

  type PlaywrightLocator = {
    click(): Promise<void>;
    fill(value: string): Promise<void>;
    check(): Promise<void>;
    first(): PlaywrightLocator;
    nth(index: number): PlaywrightLocator;
  };

  type PlaywrightPage = {
    goto(url: string): Promise<void>;
    getByRole(role: string, options?: Record<string, unknown>): PlaywrightLocator;
    getByLabel(label: string | RegExp): PlaywrightLocator;
    getByText(text: string | RegExp): PlaywrightLocator;
    locator(selector: string): PlaywrightLocator;
  };
}
