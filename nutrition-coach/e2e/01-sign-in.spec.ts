import { existsSync, readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

// The signed-in tests need the saved sign-in state from auth.setup.ts.
// The state holds a Supabase session cookie (sb-...) only after a manual Google sign-in.
const hasSavedSignIn = (): boolean => {
  if (!existsSync(authFile)) return false;
  const state = JSON.parse(readFileSync(authFile, "utf8")) as {
    cookies: { name: string }[];
  };
  return state.cookies.some((cookie) => cookie.name.startsWith("sb-"));
};

test.describe("signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("opening Today sends the user to a Login screen with one button", async ({
    page,
  }) => {
    await page.goto("/today");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("main").getByRole("button")).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });
});

test.describe("signed in", () => {
  test.skip(
    !hasSavedSignIn(),
    "No saved sign-in: run `E2E_SIGN_IN=manual pnpm e2e` once with a test Google account",
  );

  test("a signed-in user with no profile lands on Profile", async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_ACCOUNT !== "new",
      "Set E2E_ACCOUNT=new when the saved account has no profile",
    );

    await page.goto("/today");

    await expect(page).toHaveURL(/\/profile$/);
  });

  test("a signed-in user with a profile lands on Today", async ({ page }) => {
    test.skip(
      process.env.E2E_ACCOUNT !== "with-profile",
      "Set E2E_ACCOUNT=with-profile when the saved account has a profile",
    );

    await page.goto("/today");

    await expect(page).toHaveURL(/\/today$/);
  });
});
