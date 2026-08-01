import { test, expect } from "@playwright/test";

test.describe("Admin HORECA CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/horeca");
  });

  test("should display horeca list page", async ({ page }) => {
    await expect(page.getByText("Manajemen HORECA")).toBeVisible();
    await expect(page.getByText("Tambah HORECA")).toBeVisible();
  });

  test("should open create modal", async ({ page }) => {
    await page.getByRole("button", { name: /tambah horeca/i }).click();
    await expect(page.getByText("Simpan")).toBeVisible();
  });
});
