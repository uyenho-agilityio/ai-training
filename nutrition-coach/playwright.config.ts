import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";

// Test-only settings for the Supabase test project (see docs in CLAUDE.md).
// Kept in a gitignored file so the app's .env.local (production) is never used by e2e.
const e2eEnvFile = ".env.e2e.local";
if (existsSync(e2eEnvFile)) process.loadEnvFile(e2eEnvFile);
const e2eSupabaseUrl = process.env.E2E_SUPABASE_URL;
const e2eSupabaseKey = process.env.E2E_SUPABASE_ANON_KEY;

export default defineConfig({
  testDir: "./e2e",
  // Signed-in tests share one test account and one day of entries, so they run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    // A server already on port 3000 may use the production project, so e2e starts its own.
    reuseExistingServer: !process.env.CI && !e2eSupabaseUrl,
    env:
      e2eSupabaseUrl && e2eSupabaseKey
        ? {
            NEXT_PUBLIC_SUPABASE_URL: e2eSupabaseUrl,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: e2eSupabaseKey,
          }
        : {},
  },
});
