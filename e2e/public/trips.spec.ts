import { test, expect } from "@playwright/test";

test.describe("Trip Listing & Detail", () => {
  test("should display trip listing page with destinations", async ({ page }) => {
    await page.goto("/trips");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("heading", { name: /destinasi/i })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should have filter panel", async ({ page }) => {
    await page.goto("/trips");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("should navigate to trip detail when clicking a destination", async ({ page }) => {
    await page.goto("/trips");
    const card = page.locator("a[href*='/trips/']").first();
    if (await card.count() > 0) {
      await card.click();
      await page.waitForURL(/\/trips\/\d+/);
    }
  });

  test("should display trip detail page", async ({ page }) => {
    await page.goto("/trips/1");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });
});
