import { expect, test, type Page } from "@playwright/test";

import { saveProfile } from "./helpers";
import { hasSavedSignIn } from "./savedSignIn";

// Ticket 10 demo: 70 kg moderate shows 2,750 ml; active shows 2,950 ml.
test.describe("water target", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  const waterTarget = (page: Page) =>
    page
      .getByText("Water target", { exact: true })
      .locator("..")
      .getByText(/ml$/);

  test.afterEach(async ({ page }) => {
    // Put back the fixed test profile from auth.setup.ts.
    await saveProfile(page, { weightKg: "80", activity: "moderate" });
  });

  test("70 kg moderate is 2,750 ml, and active is 2,950 ml", async ({
    page,
  }) => {
    await saveProfile(page, { weightKg: "70", activity: "moderate" });
    await page.goto("/today");
    await expect(waterTarget(page)).toHaveText("2,750 ml");

    await saveProfile(page, { weightKg: "70", activity: "active" });
    await page.goto("/today");
    await expect(waterTarget(page)).toHaveText("2,950 ml");
  });
});
