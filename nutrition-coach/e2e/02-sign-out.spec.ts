import { existsSync, readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

const hasSavedSignIn = (): boolean => {
  if (!existsSync(authFile)) return false;
  const state = JSON.parse(readFileSync(authFile, "utf8")) as {
    cookies: { name: string }[];
  };
  return state.cookies.some((cookie) => cookie.name.startsWith("sb-"));
};

// Signing out ends the saved session on Supabase, so later signed-in tests
// need a new sign-in. Run this on purpose with E2E_SIGN_OUT=1, then delete
// playwright/.auth/user.json.
test.describe("sign out", () => {
  test.skip(
    !hasSavedSignIn() || process.env.E2E_SIGN_OUT !== "1",
    "Set E2E_SIGN_OUT=1 with a saved sign-in. Signing out ends that session.",
  );

  test("sign out from the header shows the Login screen, then Today redirects to Login", async ({
    page,
  }) => {
    await page.goto("/profile");
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Sign out" })
      .click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();

    await page.goto("/today");
    await expect(page).toHaveURL(/\/login$/);
  });
});
