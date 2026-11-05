import { existsSync } from "node:fs";

import { expect, test as setup, type Page } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";

import { E2E_FOOD_PREFIX, saveProfile } from "./helpers";

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
      // Hands the new session back, so the same client can clean up test data.
      getAll() {
        return [...cookies].map(([name, { value }]) => ({ name, value }));
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

  return supabase;
}

// Removes the custom foods e2e made in earlier runs (names start with E2E_FOOD_PREFIX).
// Their entries go first: deleting a used custom food fails (see CLAUDE.md).
// RLS limits both deletes to the signed-in test account.
async function removeE2eCustomFoods(
  supabase: Awaited<ReturnType<typeof signInWithPassword>>,
) {
  const { data: foods, error } = await supabase
    .from("custom_foods")
    .select("id")
    .like("name", `${E2E_FOOD_PREFIX}%`);
  if (error) throw new Error(`Could not list e2e foods: ${error.message}`);

  const ids = foods.map((food) => food.id as string);
  if (ids.length === 0) return;

  const entries = await supabase
    .from("meal_entries")
    .delete()
    .in("custom_food_id", ids);
  if (entries.error) {
    throw new Error(`Could not remove e2e entries: ${entries.error.message}`);
  }

  const removed = await supabase.from("custom_foods").delete().in("id", ids);
  if (removed.error) {
    throw new Error(`Could not remove e2e foods: ${removed.error.message}`);
  }
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

  // The main account must not be the no-profile account, or the profile step would save one there.
  if (email && email === process.env.E2E_NEW_EMAIL) {
    throw new Error("E2E_EMAIL must be the main account, not E2E_NEW_EMAIL.");
  }

  if (email && password && url && key) {
    const supabase = await signInWithPassword(page, {
      email,
      password,
      url,
      key,
    });
    await removeE2eCustomFoods(supabase);

    // Save a fixed profile so Today has a target. Same values as the first save in 03.
    await saveProfile(page, { weightKg: "80", activity: "moderate" });
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
