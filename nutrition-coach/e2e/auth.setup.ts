import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("save sign-in state", async ({ page }) => {
  await page.goto("/");
  await page.context().storageState({ path: authFile });
});
