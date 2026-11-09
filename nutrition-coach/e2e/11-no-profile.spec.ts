import { expect, test } from "@playwright/test";

// Runs in the "no-profile" project, which signs in as the second test account.
// That account must never get a profile, so this spec does not save one.
test("a signed-in user with no profile lands on Profile", async ({ page }) => {
  test.skip(
    !process.env.E2E_NEW_EMAIL,
    "Set E2E_NEW_EMAIL and E2E_NEW_PASSWORD to run the no-profile test.",
  );

  await page.goto("/today");

  await expect(page).toHaveURL(/\/profile$/);
});

// Ticket 11: Today is only for users with a profile, so Profile shows no link to it.
test("Profile shows no link to Today when there is no profile", async ({
  page,
}) => {
  test.skip(
    !process.env.E2E_NEW_EMAIL,
    "Set E2E_NEW_EMAIL and E2E_NEW_PASSWORD to run the no-profile test.",
  );

  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Today" })).toHaveCount(0);
});
