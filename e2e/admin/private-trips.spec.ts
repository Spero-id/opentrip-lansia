import { test, expect } from "@playwright/test";

test.describe("Admin Private Trips", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/private-trips");
  });

  test("should display private trips list page", async ({ page }) => {
    await expect(page.getByText("Private Trip Request")).toBeVisible();
  });

  test("should have status filter", async ({ page }) => {
    await expect(page.getByRole("combobox").first()).toBeVisible();
  });

  test("should have search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/cari/i);
    await expect(searchInput.first()).toBeVisible();
  });
});
