import { expect, test } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// The signed-in tests need the saved sign-in state from auth.setup.ts.
// With E2E_EMAIL and E2E_PASSWORD set, auth.setup.ts refreshes that state on every run.
// The no-profile test is in 11-no-profile.spec.ts, which uses a second account.

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

  test("a signed-in user with a profile lands on Today", async ({ page }) => {
    await page.goto("/today");

    await expect(page).toHaveURL(/\/today$/);
  });
});
