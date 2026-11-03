export type Theme = "light" | "dark";

// null means the user has not picked a theme yet, so the device setting decides.
export function resolveTheme(theme: Theme | null, systemPrefersDark: boolean): Theme {
  if (theme === null) {
    return systemPrefersDark ? "dark" : "light";
  }
  return theme;
}
