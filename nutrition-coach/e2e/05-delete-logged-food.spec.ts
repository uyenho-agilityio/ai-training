import { expect, test } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// Needs a saved sign-in and a saved profile: run E2E_SIGN_IN=manual pnpm e2e once first.
test.describe("delete a logged food", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("deleting a logged dish brings the totals back", async ({ page }) => {
    await page.goto("/today");

    const remainingKcal = page
      .getByText("Remaining", { exact: true })
      .locator("..")
      .getByText(/kcal$/);
    const before = Number(
      (await remainingKcal.textContent())?.replace(" kcal", ""),
    );

    // Earlier tests may have logged the same dish today, so compare with the count before.
    const rowsBefore = await page
      .getByRole("listitem")
      .filter({ hasText: "Baby clam rice" })
      .count();

    await page.getByLabel("Dish").selectOption("Baby clam rice");
    await page.getByRole("button", { name: "Log dish" }).click();
    await expect(remainingKcal).toHaveText(`${before - 291} kcal`);

    await page
      .getByRole("button", { name: "Delete Baby clam rice" })
      .last()
      .click();

    await expect(
      page.getByRole("listitem").filter({ hasText: "Baby clam rice" }),
    ).toHaveCount(rowsBefore);
    await expect(remainingKcal).toHaveText(`${before} kcal`);
  });
});
