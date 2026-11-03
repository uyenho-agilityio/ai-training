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
test.describe("theme switch", () => {
  test.skip(
    !hasSavedSignIn(),
    "Needs a saved sign-in in playwright/.auth/user.json.",
  );

  test("dark survives a reload with no light flash", async ({ page }) => {
    await page.goto("/today");

    await page.getByRole("radio", { name: "Dark" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.goto("/today");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
  });
});
