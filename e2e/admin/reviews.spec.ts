import { test, expect } from "@playwright/test";

test.describe("Admin Reviews CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/reviews");
  });

  test("should display reviews list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Ulasan")).toBeVisible();
  });

  test("should have review table columns", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Rating" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });
});
