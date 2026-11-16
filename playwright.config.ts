import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  globalTimeout: 60 * 60 * 1000,
  reporter: "html",
  retries: process.env.CI ? 1 : 0,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  use: {
    baseURL: "http://localhost:4321/",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run astro:preview",
    url: "http://localhost:4321/",
    reuseExistingServer: !process.env.CI,
  },
});
