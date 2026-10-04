import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/testing/setup-tests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: { BASE_URL: "http://localhost:3000" },
    exclude: [...configDefaults.exclude, "e2e/**", "public/**"],
  },
});
