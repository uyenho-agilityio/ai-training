import { themeStorageKey } from "@/stores/useThemeStore";

// Runs before first paint: sets data-theme from the saved choice, or from the OS when the user has not picked one.
export const themeScript = `(function () {
  try {
    var theme = JSON.parse(localStorage.getItem(${JSON.stringify(themeStorageKey)}) || "{}").state.theme;
    var dark = theme === "dark" || (theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  } catch (error) {}
})();`;
