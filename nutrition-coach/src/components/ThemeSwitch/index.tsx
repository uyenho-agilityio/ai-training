"use client";

import { useEffect, useState } from "react";

import { useThemeStore } from "@/stores/useThemeStore";
import { resolveTheme, type ThemeChoice } from "@/utils/resolveTheme";

const options: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeSwitch() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await useThemeStore.persist.rehydrate();
      if (active) setLoaded(true);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Wait for the saved choice, so the default 'system' never overwrites a saved dark theme.
    if (!loaded) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(
        theme,
        media.matches,
      );
    };

    apply();
    if (theme !== "system") return;

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [loaded, theme]);

  return (
    <fieldset className="flex items-center gap-1 rounded-chip border border-primary p-1">
      <legend className="sr-only">Theme</legend>
      {options.map(({ value, label }) => (
        <label
          key={value}
          className="cursor-pointer rounded-chip px-3 py-1 text-sm font-semibold text-primary has-[:checked]:bg-primary has-[:checked]:text-on-primary"
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={theme === value}
            onChange={() => setTheme(value)}
            className="sr-only"
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
