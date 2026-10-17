import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5000",
    browserName: "chromium",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npx --yes firebase-tools emulators:start --only hosting --project demo-kya",
    cwd: resolve(process.env.ASSESSMENT_FRONTEND_DIR ?? process.cwd(), ".."),
    url: "http://127.0.0.1:5000",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
