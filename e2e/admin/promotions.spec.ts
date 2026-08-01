import { test, expect } from "@playwright/test";

test.describe("Admin Promotions CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/promotions");
  });

  test("should display promotions list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Kode Promo")).toBeVisible();
  });

  test("should open create modal", async ({ page }) => {
    await page.getByRole("button", { name: /tambah/i }).click();
    await expect(page.getByText("Kode Promo")).toBeVisible();
  });
});
