import { expect, test } from "@playwright/test";

test.describe("admin approval foundations", () => {
  test("admin route requires auth or shows auth setup state", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.locator("body")).toContainText(/admin authentication|auth setup|sign in/i);
  });

  test("requests inbox and booking detail avoid raw statuses", async ({ page }) => {
    await page.goto("/admin/requests");
    await expect(page.locator("body")).not.toContainText(/pending_admin_review|payment_hold|outside_zone/i);

    await page.goto("/admin/requests/mock-request-1");
    await expect(page.locator("body")).toContainText(/checklist|service zone|parking/i);
    await expect(page.locator("body")).not.toContainText(/pending_admin_review|payment_hold|outside_zone/i);
  });

  test("approve and decline sheets can open when detail UI is reachable", async ({ page }) => {
    await page.goto("/admin/requests/mock-request-1");

    await page.getByRole("button", { name: /approve/i }).click();
    await expect(page.getByText(/approve this booking/i)).toBeVisible();

    await page.getByRole("button", { name: /decline/i }).click();
    await expect(page.getByText(/decline request/i)).toBeVisible();
  });
});
