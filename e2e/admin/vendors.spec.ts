import { test, expect } from "@playwright/test";

test.describe("Admin Vendors CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/vendors");
  });

  test("should display vendors list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Vendor")).toBeVisible();
    await expect(page.getByText("Tambah Vendor")).toBeVisible();
  });

  test("should open create modal", async ({ page }) => {
    await page.getByRole("button", { name: /tambah vendor/i }).click();
    await expect(page.getByText("Simpan")).toBeVisible();
  });
});
