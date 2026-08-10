import { test, expect } from "@playwright/test";

test.describe("Admin Users Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/users");
  });

  test("should display users management page title and stats", async ({ page }) => {
    await expect(page.getByText("Manajemen User Terdaftar")).toBeVisible();
    await expect(page.getByText("Total User")).toBeVisible();
    await expect(page.getByText("User Biasa")).toBeVisible();
    await expect(page.getByText("Agent Partner")).toBeVisible();
    await expect(page.getByText("Administrator")).toBeVisible();
  });

  test("should display filter and search controls", async ({ page }) => {
    await expect(page.getByPlaceholder("Cari nama, email, telepon...")).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
  });
});
