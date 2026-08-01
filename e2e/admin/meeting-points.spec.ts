import { test, expect } from "@playwright/test";

test.describe("Admin Meeting Points CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/meeting-points");
  });

  test("should display meeting points list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Meeting Point")).toBeVisible();
    await expect(page.getByText("Tambah Meeting Point")).toBeVisible();
  });

  test("should open create modal", async ({ page }) => {
    await page.getByRole("button", { name: /tambah meeting point/i }).click();
    await expect(page.getByText("Simpan")).toBeVisible();
  });
});
