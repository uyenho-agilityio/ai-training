import { expect, test } from "@playwright/test";

import { addAndLogCustomFood } from "./helpers";
import { hasSavedSignIn } from "./savedSignIn";

// Ticket 07 demo: go over target, see the warning, log one more food.
test.describe("over-target warning", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("going over target shows the warning and logging still works", async ({
    page,
  }) => {
    // 3000 kcal is above any target the test profile reaches (2211 kcal at 80 kg,
    // 2288 kcal after 03 saves 85 kg), so one log puts the day over.
    await addAndLogCustomFood(page, "feast", {
      kcal: "3000",
      proteinG: "0",
      carbG: "0",
      fatG: "0",
    });

    await page.goto("/today");

    const remainingKcal = page
      .getByText("Remaining", { exact: true })
      .locator("..")
      .getByText(/kcal$/);
    const before = Number(
      (await remainingKcal.textContent())?.replace(" kcal", ""),
    );
    expect(before).toBeLessThan(0);
    await expect(page.getByText("Over target")).toBeVisible();

    await page.getByLabel("Dish").selectOption("Baby clam rice");
    await page.getByRole("button", { name: "Log dish" }).click();

    await expect(remainingKcal).toHaveText(`${before - 291} kcal`);
    await expect(page.getByText("Over target")).toBeVisible();
  });
});
