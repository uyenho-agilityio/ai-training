import { expect, test } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// Signing out ends the saved session on Supabase (scope global), so it runs last,
// in its own "sign-out" project (playwright.config.ts).
// Later runs sign in again in auth.setup.ts.
test.describe("sign out", () => {
  test.skip(!hasSavedSignIn(), "Needs a saved sign-in.");

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
