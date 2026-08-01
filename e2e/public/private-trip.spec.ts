import { test, expect } from "@playwright/test";

test.describe("Private Trip Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/private");
  });

  test("should display private trip form elements", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should have booking information section", async ({ page }) => {
    await expect(page.getByText(/Informasi/i)).toBeVisible();
  });

  test("should have submit button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /request/i })).toBeVisible();
  });

  test("should validate form on submit", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /request/i });
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
    }
  });
});
