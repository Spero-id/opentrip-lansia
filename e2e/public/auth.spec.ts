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
      await expect(page.getByRole("button", { name: "Masuk", exact: true })).toBeVisible();
      await expect(page.getByText("Masuk dengan Google")).toBeVisible();
    });

    test("should have password visibility toggle", async ({ page }) => {
      const passwordInput = page.getByPlaceholder("Masukkan password kamu");
      await expect(passwordInput).toHaveAttribute("type", "password");

      await expect(async () => {
        await page.getByRole("button", { name: "Tampilkan password" }).click();
        await expect(passwordInput).toHaveAttribute("type", "text");
      }).toPass();

      await page.getByRole("button", { name: "Sembunyikan password" }).click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("should have register link", async ({ page }) => {
      await page.getByText("Daftar di sini").click();
      await page.waitForURL("/register");
    });

    test("should show error on invalid login", async ({ page }) => {
      await page.getByPlaceholder("Masukkan email kamu").fill("wrong@email.com");
      await page.getByPlaceholder("Masukkan password kamu").fill("wrongpass");
      await page.getByRole("button", { name: "Masuk", exact: true }).click();
    });
  });

  test.describe("Stabilitas tinggi kartu", () => {
    // The image column stretches to match the form column height (grid stretch),
    // so the card height must be measured before and after errors appear.
    // Short viewport so card height is driven by the form content (not the viewport),
    // so this test still detects height growth caused by errors.
    async function gotoAuth(page: import("@playwright/test").Page, path: string) {
      await page.setViewportSize({ width: 1280, height: 600 });
      await page.goto(path);
      // wait for React hydration so the submit is handled by the form
      await page.waitForLoadState("networkidle");
    }

    async function cardHeight(page: import("@playwright/test").Page) {
      return page.evaluate(() => {
        const aside = document.querySelector<HTMLDivElement>('div[style*="-image"]');
        if (!aside?.parentElement) return null;
        return Math.round(aside.parentElement.getBoundingClientRect().height);
      });
    }

    test("login: tinggi kartu tidak berubah saat error validasi", async ({ page }) => {
      await gotoAuth(page, "/login");

      const before = await cardHeight(page);

      await page.getByRole("button", { name: "Masuk", exact: true }).click();
      await expect(page.getByText("Email wajib diisi")).toBeVisible();

      expect(await cardHeight(page)).toBe(before);
    });

    test("login: tinggi kartu tidak berubah saat banner error server", async ({ page }) => {
      await gotoAuth(page, "/login");

      const before = await cardHeight(page);

      await page.getByPlaceholder("Masukkan email kamu").fill("wrong@email.com");
      await page.getByPlaceholder("Masukkan password kamu").fill("wrongpass");
      await page.getByRole("button", { name: "Masuk", exact: true }).click();
      await expect(page.locator("div.bg-red-50")).toBeVisible({ timeout: 15000 });

      expect(await cardHeight(page)).toBe(before);
    });

    test("register: tinggi kartu tidak berubah saat error validasi", async ({ page }) => {
      await gotoAuth(page, "/register");

      const before = await cardHeight(page);

      await page.getByRole("button", { name: "Daftar", exact: true }).click();
      await expect(page.getByText("Nama wajib diisi")).toBeVisible();

      expect(await cardHeight(page)).toBe(before);
    });
  });

  test.describe("Register Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/register");
    });

    test("should display register form elements", async ({ page }) => {
      await expect(page.getByText("Buat Akun Baru")).toBeVisible();
      await expect(page.getByPlaceholder("Masukkan nama kamu")).toBeVisible();
      await expect(page.getByPlaceholder("Masukkan email kamu")).toBeVisible();
      await expect(page.getByPlaceholder("Masukkan password kamu")).toBeVisible();
      await expect(page.getByRole("button", { name: "Daftar", exact: true })).toBeVisible();
    });

    test("should have login link", async ({ page }) => {
      await page.getByRole("link", { name: "Masuk di sini" }).click();
      await page.waitForURL("/login");
    });
  });
});
