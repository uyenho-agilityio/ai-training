import { expect, test } from "@playwright/test";

import { saveProfile } from "./helpers";
import { hasSavedSignIn } from "./savedSignIn";

// Needs a saved sign-in: run E2E_SIGN_IN=manual pnpm e2e once first.
test.describe("profile and daily target", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("save profile shows the target, and changing weight updates it", async ({
    page,
  }) => {
    await saveProfile(page, { weightKg: "80", activity: "moderate" });

    // Mifflin-St Jeor: 1748.75 × 1.55 − 500 = 2210.56 → 2211 kcal
    await expect(page.getByText("2211 kcal")).toBeVisible();

    await page.getByLabel("Weight (kg)").fill("85");
    await page.getByRole("button", { name: "Save profile" }).click();

    // 1798.75 × 1.55 − 500 = 2288.06 → 2288 kcal
    await expect(page.getByText("2288 kcal")).toBeVisible();
    await expect(page.getByText("2211 kcal")).toHaveCount(0);
  });
});
