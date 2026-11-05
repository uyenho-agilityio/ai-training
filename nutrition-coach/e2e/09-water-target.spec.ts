import { expect, test, type Page } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// Ticket 10 demo. Named 09 so it runs before 10-sign-out, which ends the session.
test.describe("water target", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  const saveProfile = async (
    page: Page,
    weightKg: string,
    activity: string,
  ) => {
    await page.goto("/profile");
    await page.getByRole("radio", { name: "Male", exact: true }).check();
    await page.getByLabel("Age").fill("30");
    await page.getByLabel("Height (cm)").fill("175");
    await page.getByLabel("Weight (kg)").fill(weightKg);
    await page.getByLabel("Activity level").selectOption(activity);
    // Wait for the saveProfile Server Action to finish before leaving the page.
    await Promise.all([
      page.waitForResponse(
        (response) => response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Save profile" }).click(),
    ]);
  };

  const waterTarget = (page: Page) =>
    page
      .getByText("Water target", { exact: true })
      .locator("..")
      .getByText(/ml$/);

  test.afterEach(async ({ page }) => {
    // Put back the fixed test profile from auth.setup.ts.
    await saveProfile(page, "80", "moderate");
  });

  test("70 kg moderate is 2,750 ml, and active is 2,950 ml", async ({
    page,
  }) => {
    await saveProfile(page, "70", "moderate");
    await page.goto("/today");
    await expect(waterTarget(page)).toHaveText("2,750 ml");

    await saveProfile(page, "70", "active");
    await page.goto("/today");
    await expect(waterTarget(page)).toHaveText("2,950 ml");
  });
});
