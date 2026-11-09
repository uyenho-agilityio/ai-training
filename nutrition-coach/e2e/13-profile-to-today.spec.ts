import { expect, test } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// Ticket 11: a user with a profile can go from Profile back to Today.
test.describe("profile to today", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("Profile links back to Today", async ({ page }) => {
    await page.goto("/today");
    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);

    await page.getByRole("link", { name: "Today" }).click();
    await expect(page).toHaveURL(/\/today$/);
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  });
});
