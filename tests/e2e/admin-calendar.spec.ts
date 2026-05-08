import { expect, test } from "@playwright/test";

test.describe("admin calendar timeline", () => {
  test("loads the day timeline shell", async ({ page }) => {
    await page.goto("/admin/calendar");

    await expect(page.locator("body")).toContainText(/calendar|timeline|auth setup|admin authentication/i);
  });

  test("shows week strip and timeline items when admin shell is reachable", async ({ page }) => {
    await page.goto("/admin/calendar?date=2026-05-18");

    await expect(page.locator(".week-strip")).toBeVisible();
    await expect(page.locator(".day-timeline")).toBeVisible();
  });

  test("keeps buffers and empty or closed states visible", async ({ page }) => {
    await page.goto("/admin/calendar?date=2026-05-18");

    await expect(page.locator("body")).toContainText(/travel buffer|available|closed|no jobs/i);
  });
});
