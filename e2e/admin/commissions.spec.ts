import { test, expect } from "@playwright/test";

test.describe("Admin Commissions CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/commissions");
  });

  test("should display commissions list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Komisi Agen")).toBeVisible();
  });

  test("should open create modal", async ({ page }) => {
    await page.getByRole("button", { name: /tambah/i }).click();
    await expect(page.getByText("Simpan")).toBeVisible();
  });
});
