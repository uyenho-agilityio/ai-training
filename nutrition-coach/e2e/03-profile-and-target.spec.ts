import { existsSync, readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

const hasSavedSignIn = (): boolean => {
  if (!existsSync(authFile)) return false;
  const state = JSON.parse(readFileSync(authFile, "utf8")) as {
    cookies: { name: string }[];
  };
  return state.cookies.some((cookie) => cookie.name.startsWith("sb-"));
};

// Needs a saved sign-in: run E2E_SIGN_IN=manual pnpm e2e once first.
test.describe("profile and daily target", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("save profile shows the target, and changing weight updates it", async ({
    page,
  }) => {
    await page.goto("/profile");

    await page.getByRole("radio", { name: "Male" }).check();
    await page.getByLabel("Age").fill("30");
    await page.getByLabel("Height (cm)").fill("175");
    await page.getByLabel("Weight (kg)").fill("80");
    await page.getByLabel("Activity level").selectOption("moderate");
    await page.getByRole("button", { name: "Save profile" }).click();

    // Mifflin-St Jeor: 1748.75 × 1.55 − 500 = 2210.56 → 2211 kcal
    await expect(page.getByText("2211 kcal")).toBeVisible();

    await page.getByLabel("Weight (kg)").fill("85");
    await page.getByRole("button", { name: "Save profile" }).click();

    // 1798.75 × 1.55 − 500 = 2288.06 → 2288 kcal
    await expect(page.getByText("2288 kcal")).toBeVisible();
    await expect(page.getByText("2211 kcal")).toHaveCount(0);
  });
});
