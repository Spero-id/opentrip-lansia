import { test, expect } from "@playwright/test";

test.describe("Admin Pesanan (Bookings)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/pesanan");
  });

  test("should display bookings list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Pesanan")).toBeVisible();
  });

  test("should display booking table columns", async ({ page }) => {
    await expect(page.getByText("Kode Booking")).toBeVisible();
    await expect(page.getByText("Pemesan")).toBeVisible();
    await expect(page.getByText("Total")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();
  });
});
