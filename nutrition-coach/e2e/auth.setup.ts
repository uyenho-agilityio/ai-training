import { existsSync } from "node:fs";

import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

// Saves the sign-in state once and reuses it in later runs.
// With E2E_SIGN_IN=manual, the browser opens the Login screen and a tester signs in
// with a test Google account by hand. Google's own screen is not automated.
// Delete playwright/.auth/user.json to sign in again. The file is never committed.
setup("save sign-in state", async ({ page }) => {
  if (existsSync(authFile)) return;

  if (process.env.E2E_SIGN_IN !== "manual") {
    await page.context().storageState({ path: authFile });
    return;
  }

  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await page.waitForURL(/\/(today|profile)$/, { timeout: 5 * 60_000 });
  await page.context().storageState({ path: authFile });
});
