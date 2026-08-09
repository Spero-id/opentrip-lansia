import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
  });

  test("should display admin sidebar", async ({ page }) => {
    await expect(page.locator("aside").getByText("ADMIN").first()).toBeVisible();
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Dashboard")).toBeVisible();
    await expect(sidebar.getByText("Paket Trip")).toBeVisible();
    await expect(sidebar.getByText("Destinasi")).toBeVisible();
    await expect(sidebar.getByText("HORECA")).toBeVisible();
    await expect(sidebar.getByText("Vendor")).toBeVisible();
    await expect(sidebar.getByText("Promo")).toBeVisible();
    await expect(sidebar.getByText("Komisi")).toBeVisible();
    await expect(sidebar.getByText("Ulasan")).toBeVisible();
    await expect(sidebar.getByText("Meeting Point")).toBeVisible();
    await expect(sidebar.getByText("Blog")).toBeVisible();
    await expect(sidebar.getByText("Pesanan")).toBeVisible();
    await expect(sidebar.getByText("Private Trip")).toBeVisible();
  });

  test("should display KPI cards", async ({ page }) => {
    await expect(page.getByText("Total Paket Trip")).toBeVisible();
    await expect(page.getByText("Pemesanan Bulan Ini")).toBeVisible();
    await expect(page.getByText("Total Pendapatan")).toBeVisible();
    await expect(page.getByText("Promo Aktif")).toBeVisible();
  });

  test("should display recent bookings table", async ({ page }) => {
    await expect(page.getByText("Pemesanan Terbaru")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Kode Booking" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Pemesan" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Destinasi" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Total" })).toBeVisible();
  });

  test("should have create trip button", async ({ page }) => {
    await expect(page.getByText("Buat Trip Baru")).toBeVisible();
  });

  test("should navigate to trip list via sidebar", async ({ page }) => {
    await page.locator("aside a").filter({ hasText: "Paket Trip" }).click();
    await expect(page).toHaveURL(/\/admin\/trips/);
  });
});
