import { expect, test } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// Ticket 06 demo: create a food, log it, see it in today's list.
test.describe("custom food", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("a new custom food can be logged and shows in today's list", async ({
    page,
  }) => {
    // Custom foods stay between runs, so each run uses a new name.
    const name = `E2E bowl ${Date.now()}`;

    await page.goto("/add-food");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Calories (kcal)").fill("420");
    await page.getByLabel("Protein (g)").fill("30");
    await page.getByLabel("Carbs (g)").fill("40");
    await page.getByLabel("Fat (g)").fill("12");
    await page.getByRole("button", { name: "Save food" }).click();

    const saved = page.getByRole("listitem", { name });
    await expect(saved).toContainText("420 kcal");

    // Wait for the logCustomFood Server Action to finish before leaving the page.
    await Promise.all([
      page.waitForResponse(
        (response) => response.request().method() === "POST",
      ),
      page.getByRole("button", { name: `Log ${name}` }).click(),
    ]);

    await page.goto("/today");
    await expect(
      page.getByRole("listitem").filter({ hasText: name }),
    ).toContainText("420 kcal");
  });
});
