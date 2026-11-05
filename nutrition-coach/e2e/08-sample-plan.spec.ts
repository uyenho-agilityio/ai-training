import { expect, test } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// Ticket 08 demo: open a plan day, see three meals and their calories.
test.describe("sample meal plan", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("a plan day shows three meals, their calories and the day total", async ({
    page,
  }) => {
    await page.goto("/today");

    const plan = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Sample meal plan" }),
    });
    await expect(plan.getByRole("button", { name: /^Day \d$/ })).toHaveCount(7);

    const eatenBefore = await page
      .getByText("Eaten", { exact: true })
      .locator("..")
      .getByText(/kcal$/)
      .textContent();
    expect(eatenBefore).toMatch(/^\d+ kcal$/);

    await plan.getByRole("button", { name: "Day 3" }).click();
    await expect(plan.getByRole("button", { name: "Day 3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const meals = plan.getByRole("listitem");
    await expect(meals).toHaveCount(3);
    for (const [index, label] of ["Breakfast", "Lunch", "Dinner"].entries()) {
      await expect(meals.nth(index)).toContainText(label);
      await expect(meals.nth(index)).toContainText(/\d+ kcal$/);
    }
    // Earlier tests change the profile, so read the target from the Target card.
    const target = await page
      .getByText("Target", { exact: true })
      .locator("..")
      .getByText(/kcal$/)
      .textContent();
    await expect(
      plan.getByText(new RegExp(`^\\d+ kcal of ${target} target$`)),
    ).toBeVisible();

    // Choosing a plan day does not log anything.
    await expect(
      page.getByText("Eaten", { exact: true }).locator("..").getByText(/kcal$/),
    ).toHaveText(eatenBefore!);
  });
});
