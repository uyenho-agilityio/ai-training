import { expect, test } from "@playwright/test";

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
    // One custom food above the whole 2211 kcal target puts the day over in one log.
    const name = `E2E feast ${Date.now()}`;

    await page.goto("/add-food");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Calories (kcal)").fill("3000");
    await page.getByLabel("Protein (g)").fill("0");
    await page.getByLabel("Carbs (g)").fill("0");
    await page.getByLabel("Fat (g)").fill("0");
    await page.getByRole("button", { name: "Save food" }).click();
    // Wait for the logCustomFood Server Action to finish before leaving the page.
    await Promise.all([
      page.waitForResponse(
        (response) => response.request().method() === "POST",
      ),
      page.getByRole("button", { name: `Log ${name}` }).click(),
    ]);

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
