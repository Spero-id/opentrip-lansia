import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display all major sections", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should have HeroSection with CTA", async ({ page }) => {
    const hero = page.getByText(/Jelajahi|Petualangan|Trip/).first();
    await expect(hero).toBeVisible();
  });

  test("should have DestinationSection", async ({ page }) => {
    await expect(page.locator("text=Destinasi").first()).toBeVisible();
  });

  test("should have FAQSection", async ({ page }) => {
    await expect(page.getByText("Pertanyaan Yang Sering Diajukan")).toBeVisible();
  });

  test("should have TestimonialsSection", async ({ page }) => {
    await expect(page.getByText("Apa Kata Mereka")).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: "Login", exact: true }).click();
    await page.waitForURL(/\/login/);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.getByRole("link", { name: "Register", exact: true }).click();
    await page.waitForURL(/\/register/);
  });

  test("should navigate to trips page", async ({ page }) => {
    await page.getByRole("link", { name: "Destinasi Trip" }).click();
    await page.waitForURL(/\/trips/);
  });

  test("should navigate to contact page", async ({ page }) => {
    await page.getByRole("link", { name: "Hubungi Kami" }).first().click();
    await page.waitForURL(/\/contact/);
  });
});
