import { expect, test } from "@playwright/test";

test("the home page sends a signed-out user to the Login screen", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Nutrition Coach" }),
  ).toBeVisible();
});
