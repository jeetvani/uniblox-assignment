import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  expect: { timeout: 5_000 },
  fullyParallel: false,
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  // The supplied mock API keeps mutable state in memory. A single worker
  // prevents one browser test from resetting another test's decision state.
  workers: 1,
  webServer: [
    {
      command: "bun run dev:api",
      port: 4000,
      reuseExistingServer: true,
    },
    {
      command: "bun run dev --host 127.0.0.1 --port 4173",
      port: 4173,
      reuseExistingServer: true,
    },
  ],
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
})
