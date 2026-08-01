import { test, expect } from "@playwright/test";

test.describe("Admin Galleries CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/galleries");
  });

  test("should display galleries list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Galeri")).toBeVisible();
  });

  test("should open create modal", async ({ page }) => {
    await page.getByRole("button", { name: /tambah/i }).click();
    await expect(page.locator("form").getByText("Judul")).toBeVisible();
  });
});
