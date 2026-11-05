import { expect, test } from "@playwright/test";

import { addAndLogCustomFood } from "./helpers";
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
    const name = await addAndLogCustomFood(page, "bowl", {
      kcal: "420",
      proteinG: "30",
      carbG: "40",
      fatG: "12",
    });

    await expect(page.getByRole("listitem", { name })).toContainText(
      "420 kcal",
    );

    await page.goto("/today");
    await expect(
      page.getByRole("listitem").filter({ hasText: name }),
    ).toContainText("420 kcal");
  });
});
