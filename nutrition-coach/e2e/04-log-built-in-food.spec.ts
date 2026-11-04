import { expect, test } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// Needs a saved sign-in and a saved profile: run E2E_SIGN_IN=manual pnpm e2e once first.
test.describe("log a built-in food", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("logging a dish adds a row and lowers the remaining calories", async ({
    page,
  }) => {
    await page.goto("/today");

    const remainingKcal = page
      .getByText("Remaining", { exact: true })
      .locator("..")
      .getByText(/kcal$/);
    const before = Number(
      (await remainingKcal.textContent())?.replace(" kcal", ""),
    );

    await page.getByLabel("Dish").selectOption("Baby clam rice");
    await page.getByRole("button", { name: "Log dish" }).click();

    await expect(
      page.getByRole("listitem").filter({ hasText: "Baby clam rice" }),
    ).toBeVisible();
    await expect(remainingKcal).toHaveText(`${before - 291} kcal`);
  });
});
