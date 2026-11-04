import { existsSync, readFileSync } from "node:fs";

const authFile = "playwright/.auth/user.json";

// True when signed-in tests can run: either the test account is configured
// (auth.setup.ts signs in with it on every run), or a saved session exists.
export const hasSavedSignIn = (): boolean => {
  if (process.env.E2E_EMAIL && process.env.E2E_PASSWORD) return true;
  if (!existsSync(authFile)) return false;
  const state = JSON.parse(readFileSync(authFile, "utf8")) as {
    cookies: { name: string }[];
  };
  return state.cookies.some((cookie) => cookie.name.startsWith("sb-"));
};
