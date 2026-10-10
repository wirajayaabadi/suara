import { defineConfig, devices } from "@playwright/test";

const PORT = 3211;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Memakai Chrome yang terpasang di mesin; tidak perlu mengunduh browser Playwright.
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 860 } }, grepInvert: /@ponsel/ },
    { name: "ponsel", use: { ...devices["Pixel 7"], channel: "chrome" }, grep: /@ponsel/ },
  ],
  webServer: {
    command: `npm run build:contoh && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    env: { DATA_CONTOH: "1" },
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
