import { existsSync } from "node:fs";

import { expect, test as setup } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";

const authFile = "playwright/.auth/user.json";

// Saves the sign-in state once and reuses it in later runs.
// With E2E_EMAIL and E2E_PASSWORD set (in .env.e2e.local), the test user signs in
// with email and password on the Supabase test project. This is test-only:
// the app itself still has Google sign-in only.
// With E2E_SIGN_IN=manual, the browser opens the Login screen and a tester signs in
// with a test Google account by hand. Google's own screen is not automated.
// Delete playwright/.auth/user.json to sign in again. The file is never committed.
setup("save sign-in state", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  const url = process.env.E2E_SUPABASE_URL;
  const key = process.env.E2E_SUPABASE_ANON_KEY;

  // The password sign-in is cheap, so it always refreshes the saved state.
  if (email && password && url && key) {
    const cookies = new Map<
      string,
      { value: string; options: { path?: string; maxAge?: number } }
    >();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, { value, options }),
          );
        },
      },
    });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(`Test sign-in failed: ${error.message}`);

    await page.context().addCookies(
      [...cookies].map(([name, { value, options }]) => ({
        name,
        value,
        domain: "localhost",
        path: options.path ?? "/",
        expires: options.maxAge
          ? Math.floor(Date.now() / 1000) + options.maxAge
          : -1,
        sameSite: "Lax" as const,
      })),
    );
    // Save a fixed profile so Today has a target. Same values as the first save in 03.
    await page.goto("/profile");
    await page.getByRole("radio", { name: "Male", exact: true }).check();
    await page.getByLabel("Age").fill("30");
    await page.getByLabel("Height (cm)").fill("175");
    await page.getByLabel("Weight (kg)").fill("80");
    await page.getByLabel("Activity level").selectOption("moderate");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("2211 kcal")).toBeVisible();

    // Start each run with an empty day: remove entries left by earlier runs.
    await page.goto("/today");
    const deletes = page.getByRole("button", { name: /^Delete / });
    for (
      let left = await deletes.count();
      left > 0;
      left = await deletes.count()
    ) {
      await deletes.first().click();
      await expect(deletes).toHaveCount(left - 1);
    }

    await page.context().storageState({ path: authFile });
    return;
  }

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
