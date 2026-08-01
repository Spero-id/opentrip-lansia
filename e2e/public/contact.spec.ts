import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("should display contact page elements", async ({ page }) => {
    await expect(page.getByText("Contact Us")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should display contact info panel", async ({ page }) => {
    await expect(page.getByText("Telepon").first()).toBeVisible();
    await expect(page.getByText("Email").first()).toBeVisible();
  });

  test("should have contact form", async ({ page }) => {
    await expect(page.getByPlaceholder("Nama lengkap")).toBeVisible();
    await expect(page.getByPlaceholder("nama@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("Tulis pesan")).toBeVisible();
  });

  test("should show success after form submission", async ({ page }) => {
    const nameInput = page.getByPlaceholder("Nama lengkap");
    await nameInput.fill("Test User");
    await page.getByPlaceholder("nama@email.com").fill("test@example.com");
    await page.getByPlaceholder("Tulis pesan").fill("Test message");
    await page.getByRole("button", { name: /kirim/i }).click();
    await expect(page.getByText(/terima kasih/i)).toBeVisible();
  });
});
