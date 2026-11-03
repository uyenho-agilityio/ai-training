"use client";

import { useEffect, useState } from "react";

import { useThemeStore } from "@/stores/useThemeStore";
import { resolveTheme, type Theme } from "@/utils/resolveTheme";

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function ThemeSwitch() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [loaded, setLoaded] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

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
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemPrefersDark(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const resolved = resolveTheme(theme, systemPrefersDark);

  useEffect(() => {
    // Wait for the saved choice, so the device setting never overwrites a saved theme.
    if (!loaded) return;
    document.documentElement.dataset.theme = resolved;
  }, [loaded, resolved]);

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
            checked={resolved === value}
            onChange={() => setTheme(value)}
            className="sr-only"
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
