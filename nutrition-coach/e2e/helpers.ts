import type { Page, Response } from "@playwright/test";

// Custom foods made by e2e start with this prefix, so auth.setup.ts can remove them.
export const E2E_FOOD_PREFIX = "E2E ";

// A Server Action call is a POST with the Next-Action header.
const isServerAction = (response: Response) =>
  response.request().method() === "POST" &&
  response.request().headers()["next-action"] !== undefined;

// Runs the step and waits for the Server Action it starts to answer.
// Leaving the page before that aborts the action.
export const waitForServerAction = async (
  page: Page,
  step: () => Promise<void>,
) => {
  await Promise.all([page.waitForResponse(isServerAction), step()]);
};

export const saveProfile = async (
  page: Page,
  { weightKg, activity }: { weightKg: string; activity: string },
) => {
  await page.goto("/profile");
  await page.getByRole("radio", { name: "Male", exact: true }).check();
  await page.getByLabel("Age").fill("30");
  await page.getByLabel("Height (cm)").fill("175");
  await page.getByLabel("Weight (kg)").fill(weightKg);
  await page.getByLabel("Activity level").selectOption(activity);
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Save profile" }).click(),
  );
};

// Saves a new custom food on /add-food and logs it once. Returns its name.
export const addAndLogCustomFood = async (
  page: Page,
  label: string,
  values: { kcal: string; proteinG: string; carbG: string; fatG: string },
) => {
  // Custom foods stay between runs until auth.setup.ts removes them, so each run uses a new name.
  const name = `${E2E_FOOD_PREFIX}${label} ${Date.now()}`;

  await page.goto("/add-food");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Calories (kcal)").fill(values.kcal);
  await page.getByLabel("Protein (g)").fill(values.proteinG);
  await page.getByLabel("Carbs (g)").fill(values.carbG);
  await page.getByLabel("Fat (g)").fill(values.fatG);
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Save food" }).click(),
  );
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: `Log ${name}` }).click(),
  );

  return name;
};
