import { expect, test } from "@playwright/test";

test.describe("customer booking flow", () => {
  test("reaches review with manual approval and no-payment submission", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /request a booking/i }).first().click();

    await page.getByRole("button", { name: /start booking/i }).click();
    await page.getByRole("button", { name: /maintenance/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByLabel(/make/i).fill("BMW");
    await page.getByLabel(/model/i).fill("3 Series");
    await page.getByRole("button", { name: /medium/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByRole("button", { name: /engine bay clean/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByLabel(/postcode/i).fill("CR0 1AA");
    await page.getByRole("button", { name: /check service area/i }).click();
    await page.getByLabel(/full address/i).fill("10 Example Road");
    await page.getByRole("button", { name: /^yes/i }).click();
    await page.getByLabel(/access to water/i).check();
    await page.getByLabel(/access to electricity/i).check();
    await page.getByLabel(/accessible parking location/i).check();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByRole("button", { name: /^1$/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.locator(".booking-date-card").first().click();
    await page.locator(".booking-slot-card").first().click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByLabel(/full name/i).fill("Sarah Wilson");
    await page.getByLabel(/phone/i).fill("07123456789");
    await page.getByLabel(/email/i).fill("sarah@example.com");
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByText(/this is a booking request/i)).toBeVisible();
    await expect(page.getByText(/appointment is confirmed only after manual approval/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /submit booking request/i })).toBeVisible();
  });
});
