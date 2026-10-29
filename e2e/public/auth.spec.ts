import { test, expect } from "@playwright/test";

test.describe("Auth Pages", () => {
  test.describe("Login Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test("should display login form elements", async ({ page }) => {
      await expect(page.getByText("Selamat Datang Kembali")).toBeVisible();
      await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Kata Sandi", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Masuk", exact: true })).toBeVisible();
      await expect(page.getByText("Masuk dengan Google")).toBeVisible();
    });

    test("should have password visibility toggle", async ({ page }) => {
      const passwordInput = page.getByLabel("Kata Sandi", { exact: true });
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
      await page.getByLabel("Email", { exact: true }).fill("wrong@email.com");
      await page.getByLabel("Kata Sandi", { exact: true }).fill("wrongpass");
      await page.getByRole("button", { name: "Masuk", exact: true }).click();
    });

    test("checkbox Ingat saya ikut terkirim ke server sebagai rememberMe", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("networkidle");

      const checkbox = page.getByRole("checkbox", { name: "Ingat saya" });
      // Default is checked, which matches better-auth's own default: anyone who
      // never touches the box keeps exactly the behaviour they had before.
      await expect(checkbox).toBeChecked();

      // A click only flips the box once React has bound the handler, so retrying
      // doubles as the hydration gate for the submit below.
      await expect(async () => {
        await checkbox.click();
        await expect(checkbox).not.toBeChecked();
      }).toPass();

      const sent = page.waitForRequest(
        (r) => r.method() === "POST" && r.url().includes("/api/auth/sign-in/email")
      );

      await page.getByLabel("Email", { exact: true }).fill("wrong@email.com");
      await page.getByLabel("Kata Sandi", { exact: true }).fill("wrongpass");
      await page.getByRole("button", { name: "Masuk", exact: true }).click();

      // Wire-level proof: without the wiring this field is absent, not false.
      const body = JSON.parse((await sent).postData() ?? "{}");
      expect(body.rememberMe).toBe(false);
    });
  });

  test.describe("Layout viewport-fit & stabilitas tinggi", () => {
    // The page is pinned to the viewport height (no page scroll), so the outer card
    // always equals the viewport. What must stay stable when errors appear is the
    // image column: it used to stretch with the form column and re-scale the photo.
    async function gotoAuth(
      page: import("@playwright/test").Page,
      path: string,
      size: { width: number; height: number } = { width: 1440, height: 900 }
    ) {
      await page.setViewportSize(size);
      await page.goto(path);
      // wait for React hydration so the submit is handled by the form
      await page.waitForLoadState("networkidle");
      // The compiled stylesheet must be applied before any getBoundingClientRect
      // measurement: right after a recompile the document can still be unstyled,
      // and every margin then reads as 0 (measured: gaps came back 0/0/0/0/0).
      await page.waitForFunction(() => {
        const aside = document.querySelector<HTMLDivElement>('div[style*="-image"]');
        const col = aside?.parentElement?.lastElementChild as HTMLElement | null;
        return !!col && getComputedStyle(col).paddingTop === "40px";
      });
    }

    async function pageMetrics(page: import("@playwright/test").Page) {
      return page.evaluate(() => {
        const aside = document.querySelector<HTMLDivElement>('div[style*="-image"]');
        return {
          docH: document.documentElement.scrollHeight,
          viewportH: window.innerHeight,
          asideH: aside ? Math.round(aside.getBoundingClientRect().height) : null,
        };
      });
    }

    // Errors legitimately grow the form content (no reserved slots are kept
    // anymore), so the regression to guard is the image column: it must not
    // stretch with the form and re-scale the photo.
    async function expectImageColumnStable(
      page: import("@playwright/test").Page,
      trigger: () => Promise<void>
    ) {
      const before = await pageMetrics(page);
      await trigger();
      const after = await pageMetrics(page);

      expect(after.asideH).toBe(before.asideH);
      expect(after.asideH).toBe(after.viewportH);
      expect(after.docH).toBe(after.viewportH);
    }

    test("login: tinggi aside tidak berubah saat error validasi", async ({ page }) => {
      await gotoAuth(page, "/login");

      await expectImageColumnStable(page, async () => {
        await page.getByRole("button", { name: "Masuk", exact: true }).click();
        await expect(page.getByText("Email wajib diisi")).toBeVisible();
      });
    });

    test("login: tinggi aside tidak berubah saat banner error server", async ({ page }) => {
      await gotoAuth(page, "/login");

      await expectImageColumnStable(page, async () => {
        await page.getByLabel("Email", { exact: true }).fill("wrong@email.com");
        await page.getByLabel("Kata Sandi", { exact: true }).fill("wrongpass");
        await page.getByRole("button", { name: "Masuk", exact: true }).click();
        await expect(page.getByRole("alert")).toBeVisible({ timeout: 15000 });
      });
    });

    test("register: tinggi aside tidak berubah saat error validasi", async ({ page }) => {
      await gotoAuth(page, "/register");

      await expectImageColumnStable(page, async () => {
        await page.getByRole("button", { name: "Daftar", exact: true }).click();
        await expect(page.getByText("Nama depan wajib diisi")).toBeVisible();
      });
    });

    for (const path of ["/login", "/register"]) {
      test(`${path}: jarak subjudul ke field pertama tetap rapat`, async ({ page }) => {
        await gotoAuth(page, path);

        // -1 signals the expected DOM shape is missing, which fails the bounds below.
        const gap = await page.evaluate(() => {
          const aside = document.querySelector<HTMLDivElement>('div[style*="-image"]');
          const col = aside?.parentElement?.lastElementChild as HTMLElement | null;
          const subtitle = col?.querySelector("h1 + p") as HTMLElement | null;
          const form = col?.querySelector("form") as HTMLElement | null;
          if (!subtitle || !form) return -1;
          return Math.round(
            form.getBoundingClientRect().top - subtitle.getBoundingClientRect().bottom
          );
        });

        expect(gap).toBeGreaterThan(0);
        expect(gap).toBeLessThanOrEqual(32);
      });
    }

    for (const path of ["/login", "/register"]) {
      test(`${path}: jarak antar blok form seragam 16px`, async ({ page }) => {
        await gotoAuth(page, path);

        // Empty array signals the expected DOM shape is missing, which fails below.
        const gaps = await page.evaluate(() => {
          const aside = document.querySelector<HTMLDivElement>('div[style*="-image"]');
          const col = aside?.parentElement?.lastElementChild as HTMLElement | null;
          if (!col || col.children.length < 2) return [];
          const kids = Array.from(col.children) as HTMLElement[];
          const out: number[] = [];
          for (let i = 1; i < kids.length; i++) {
            out.push(
              kids[i].getBoundingClientRect().top -
                kids[i - 1].getBoundingClientRect().bottom
            );
          }
          return out;
        });

        expect(gaps.length).toBeGreaterThan(0);
        // every block boundary must share a single value...
        expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThanOrEqual(1);
        // ...and that value is the 16px rhythm chosen for the auth column
        expect(gaps[0]).toBeGreaterThan(15);
        expect(gaps[0]).toBeLessThan(17);
      });
    }

    for (const size of [
      { width: 1440, height: 900 },
      { width: 1280, height: 700 },
    ]) {
      for (const path of ["/login", "/register"]) {
        test(`${path} pas viewport ${size.width}x${size.height}: tanpa scroll halaman`, async ({ page }) => {
          await gotoAuth(page, path, size);

          const m = await pageMetrics(page);
          expect(m.docH).toBe(m.viewportH);
          expect(m.asideH).toBe(m.viewportH);
        });
      }
    }

    test("login: konten form tetap center saat muat di viewport", async ({ page }) => {
      await gotoAuth(page, "/login", { width: 1440, height: 900 });

      const gaps = await page.evaluate(() => {
        const aside = document.querySelector<HTMLDivElement>('div[style*="-image"]');
        const col = aside?.parentElement?.lastElementChild as HTMLElement;
        const first = col.firstElementChild as HTMLElement;
        const last = col.lastElementChild as HTMLElement;
        const colRect = col.getBoundingClientRect();
        return {
          top: Math.round(first.getBoundingClientRect().top - colRect.top),
          bottom: Math.round(colRect.bottom - last.getBoundingClientRect().bottom),
        };
      });

      expect(gaps.top).toBeGreaterThan(0);
      expect(Math.abs(gaps.top - gaps.bottom)).toBeLessThanOrEqual(2);
    });

    test("register: konten form tetap terjangkau saat melebihi viewport", async ({ page }) => {
      await gotoAuth(page, "/register", { width: 1280, height: 600 });

      const state = await page.evaluate(() => {
        const aside = document.querySelector<HTMLDivElement>('div[style*="-image"]');
        const col = aside?.parentElement?.lastElementChild as HTMLElement;
        const first = col.firstElementChild as HTMLElement;
        const last = col.lastElementChild as HTMLElement;
        const colRect = col.getBoundingClientRect();
        const topGap = Math.round(first.getBoundingClientRect().top - colRect.top);

        col.scrollTop = col.scrollHeight;
        const bottomGap = Math.round(col.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom);

        return { overflows: col.scrollHeight > col.clientHeight, topGap, bottomGap };
      });

      expect(state.overflows).toBe(true);
      // auto margins collapse on overflow: the top must not be clipped away
      expect(state.topGap).toBeGreaterThanOrEqual(0);
      // and the footer must be reachable by scrolling the column
      expect(state.bottomGap).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Register Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/register");
    });

    test("should display register form elements", async ({ page }) => {
      await expect(page.getByText("Buat Akun Baru")).toBeVisible();
      await expect(page.getByLabel("Nama Depan", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Nama Belakang", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Kata Sandi", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Daftar", exact: true })).toBeVisible();
    });

    test("should have login link", async ({ page }) => {
      await page.getByRole("link", { name: "Masuk di sini" }).click();
      await page.waitForURL("/login");
    });
  });
});
