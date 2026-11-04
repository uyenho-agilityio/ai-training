import { existsSync } from "node:fs";

import { expect, test as setup, type Page } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";

const authFile = "playwright/.auth/user.json";
const newAccountFile = "playwright/.auth/new-account.json";

// Signs in with email and password on the Supabase test project, then copies the
// session cookies into the browser context. This is test-only: the app itself
// still has Google sign-in only.
async function signInWithPassword(
  page: Page,
  {
    email,
    password,
    url,
    key,
  }: { email: string; password: string; url: string; key: string },
) {
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

  const { error } = await supabase.auth.signInWithPassword({ email, password });
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
}

// Saves the sign-in state for the main test account. It refreshes on every run.
// Without E2E_EMAIL and E2E_PASSWORD, E2E_SIGN_IN=manual signs in by hand with a
// test Google account. Google's own screen is not automated.
// Delete playwright/.auth/user.json to sign in again. The file is never committed.
setup("save sign-in state", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  const url = process.env.E2E_SUPABASE_URL;
  const key = process.env.E2E_SUPABASE_ANON_KEY;

  if (email && password && url && key) {
    await signInWithPassword(page, { email, password, url, key });

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

// Saves the sign-in state for the second test account, which must never get a profile.
// Only the no-profile spec uses it. This setup never saves a profile or clears entries.
setup("save new account state", async ({ page }) => {
  const email = process.env.E2E_NEW_EMAIL;
  const password = process.env.E2E_NEW_PASSWORD;
  const url = process.env.E2E_SUPABASE_URL;
  const key = process.env.E2E_SUPABASE_ANON_KEY;

  setup.skip(
    !(email && password && url && key),
    "Set E2E_NEW_EMAIL and E2E_NEW_PASSWORD to run the no-profile test.",
  );

  await signInWithPassword(page, {
    email: email!,
    password: password!,
    url: url!,
    key: key!,
  });
  await page.context().storageState({ path: newAccountFile });
});
