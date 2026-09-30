import { defineConfig, devices } from "@playwright/test";

// Dikonfigurasi untuk mesin rendah (8GB / Ryzen 5 2500U):
//  - 1 worker, tanpa paralel, headless (pakai chromium_headless_shell)
//  - trace & video OFF (artefak paling boras RAM/disk)
//  - html reporter tidak membuka browser otomatis
//  - reuseExistingServer: true -> boleh jalankan `npm run dev` sendiri sekali,
//    Playwright tidak menduplikasi proses Next (hemat ~500MB-1GB)
// Jalankan satu spec saja jika RAM sempit, mis:
//   npm run test:e2e:smoke   (hanya e2e/public)
//   npx playwright test e2e/public/checkout.spec.ts --reporter=list
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
    video: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
