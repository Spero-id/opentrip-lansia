import { test, expect } from "@playwright/test";

test.describe("Auth Pages", () => {
  test.describe("Login Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test("should display login form elements", async ({ page }) => {
      await expect(page.getByText("Selamat Datang Kembali")).toBeVisible();
      await expect(page.getByPlaceholder("Masukkan email kamu")).toBeVisible();
      await expect(page.getByPlaceholder("Masukkan password kamu")).toBeVisible();
      await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
      await expect(page.getByText("Masuk dengan Google")).toBeVisible();
    });

    test("should have password visibility toggle", async ({ page }) => {
      const passwordInput = page.getByPlaceholder("Masukkan password kamu");
      await expect(passwordInput).toHaveAttribute("type", "password");
      const toggleButton = page.locator("button").filter({ has: page.locator("svg") }).first();
      if (await toggleButton.count() > 0) {
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute("type", "text");
      }
    });

    test("should have register link", async ({ page }) => {
      await page.getByText("Daftar di sini").click();
      await page.waitForURL("/register");
    });

    test("should show error on invalid login", async ({ page }) => {
      await page.getByPlaceholder("Masukkan email kamu").fill("wrong@email.com");
      await page.getByPlaceholder("Masukkan password kamu").fill("wrongpass");
      await page.getByRole("button", { name: /login/i }).click();
    });
  });

  test.describe("Register Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/register");
    });

    test("should display register form elements", async ({ page }) => {
      await expect(page.getByText("Buat Akun Baru")).toBeVisible();
      await expect(page.getByPlaceholder("Masukkan Username kamu")).toBeVisible();
      await expect(page.getByPlaceholder("Masukkan email kamu")).toBeVisible();
      await expect(page.getByPlaceholder("Masukkan password kamu")).toBeVisible();
      await expect(page.getByRole("button", { name: "Daftar", exact: true })).toBeVisible();
    });

    test("should have login link", async ({ page }) => {
      await page.getByText("Masuk disini").click();
      await page.waitForURL("/login");
    });
  });
});
