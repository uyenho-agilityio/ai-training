import { expect, test } from "@playwright/test";

import { hasSavedSignIn } from "./savedSignIn";

// Needs a saved sign-in: run E2E_SIGN_IN=manual pnpm e2e once first.
test.describe("theme switch", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("dark survives a reload with no light flash", async ({ page }) => {
    await page.goto("/today");

    // The radio is visually hidden, so click the visible label like a user does.
    await page.getByText("Dark", { exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.goto("/today");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
  });
});
