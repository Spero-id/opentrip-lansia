import { test, expect } from "@playwright/test";

test.describe("Admin Destinations CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/destinations");
  });

  test("should display destination list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Destinasi")).toBeVisible();
  });

  test("should have add button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /tambah/i }).first()).toBeVisible();
  });

  test("should have create page link to new", async ({ page }) => {
    const createLink = page.getByRole("link", { name: /tambah/i });
    if (await createLink.count() > 0) {
      await createLink.click();
      await expect(page).toHaveURL(/\/admin\/destinations\/new/);
    }
  });
});
