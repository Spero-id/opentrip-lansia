import { test, expect } from "@playwright/test";

test.describe("Checkout Page", () => {
  test("should display checkout page with destination param", async ({ page }) => {
    await page.goto("/checkout?destination=1");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByText(/Konfirmasi Pemesanan/i)).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should display step progress", async ({ page }) => {
    await page.goto("/checkout?destination=1");
    await expect(page.getByText(/Details|Payment|Confirmation|Konfirmasi|Pembayaran/i).first()).toBeVisible();
  });

  test("should display without destination param", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.locator("nav")).toBeVisible();
  });
});
