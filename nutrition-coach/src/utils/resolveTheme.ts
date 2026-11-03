export type ThemeChoice = "light" | "dark" | "system";

export function resolveTheme(
  theme: ThemeChoice,
  systemPrefersDark: boolean,
): "light" | "dark" {
  if (theme === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return theme;
}
