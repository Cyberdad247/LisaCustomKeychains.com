import { defineConfig, devices } from "@playwright/test";

/**
 * 🧪 E2E configuration for Lisa's Custom Keychains.
 *
 * Uses the system-installed Chrome (`channel: "chrome"`) instead of the
 * bundled Chromium download — keeps installs light on dev machines.
 * The /customize page falls back to mock products when Shopify is
 * unreachable, so the A2UI compile flow is fully testable offline.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // 8 GB machine — parallel Chrome renderers OOM ("Target crashed")
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3122",
    // Local dev uses the system-installed Chrome (no browser download).
    // CI uses Playwright's bundled Chromium, installed in the workflow.
    ...(process.env.CI ? {} : { channel: "chrome" }),
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: {
      // Trim renderer memory on constrained hosts.
      args: ["--disable-gpu", "--disable-dev-shm-usage"],
    },
  },
  expect: {
    // The compile pipeline animates (renorm → quantize → gate → deep → routed)
    // over ~1–2.5s; give assertions room on this slow machine.
    timeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // CI serves the production build (built in the workflow) for a stable,
  // representative run; local dev boots Turbopack for fast iteration.
  webServer: process.env.CI
    ? {
        command: "npx next start -p 3122",
        url: "http://localhost:3122/customize",
        reuseExistingServer: false,
        timeout: 60_000,
      }
    : {
        command: "npx next dev -p 3122",
        url: "http://localhost:3122/customize",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000, // first Turbopack compile on this machine is slow
      },
});
