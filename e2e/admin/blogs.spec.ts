import { test, expect } from "@playwright/test";

test.describe("Admin Blogs CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/blogs");
  });

  test("should display blog list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Blog")).toBeVisible();
    await expect(page.getByText("Tambah Blog")).toBeVisible();
  });

  test("should open create modal on button click", async ({ page }) => {
    await page.getByRole("button", { name: /tambah blog/i }).click();
    await expect(page.locator("form").getByText("Judul")).toBeVisible();
    await expect(page.locator("form").getByText("Slug")).toBeVisible();
    await expect(page.locator("form").getByText("Status")).toBeVisible();
  });

  test("should close modal on cancel", async ({ page }) => {
    await page.getByRole("button", { name: /tambah blog/i }).click();
    await page.getByRole("button", { name: /batal/i }).click();
    await expect(page.getByText("Manajemen Blog")).toBeVisible();
  });
});
