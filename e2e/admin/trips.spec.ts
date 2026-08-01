import { test, expect } from "@playwright/test";

test.describe("Admin Trips CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/trips");
  });

  test("should display trip list page", async ({ page }) => {
    await expect(page.getByText("Manajemen Paket Trip")).toBeVisible();
    await expect(page.getByText("Tambah Trip Baru")).toBeVisible();
    await expect(page.getByText("Judul Paket")).toBeVisible();
    await expect(page.getByText("Tipe Trip")).toBeVisible();
    await expect(page.getByText("Durasi")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();
  });

  test("should have create trip button linking to new page", async ({ page }) => {
    const createLink = page.getByRole("link", { name: /tambah trip baru/i });
    await expect(createLink).toBeVisible();
    await expect(createLink).toHaveAttribute("href", "/admin/trips/new");
  });

  test("should navigate to create trip page", async ({ page }) => {
    await page.goto("/admin/trips/new");
    await expect(page.getByRole("heading", { name: "Tambah Trip Baru" })).toBeVisible();
  });
});
