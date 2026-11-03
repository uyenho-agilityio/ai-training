import { beforeEach, describe, expect, it } from "vitest";

import { themeStorageKey, useThemeStore } from "@/stores/useThemeStore";

describe("useThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: null });
  });

  it("has no choice until the user picks one", () => {
    expect(useThemeStore.getState().theme).toBeNull();
  });

  it("saves the chosen theme on this device", () => {
    useThemeStore.getState().setTheme("dark");

    const saved = JSON.parse(localStorage.getItem(themeStorageKey) ?? "{}");
    expect(saved.state.theme).toBe("dark");
  });

  it("keeps the saved choice after a reload", async () => {
    localStorage.setItem(
      themeStorageKey,
      JSON.stringify({ state: { theme: "dark" }, version: 0 }),
    );

    await useThemeStore.persist.rehydrate();

    expect(useThemeStore.getState().theme).toBe("dark");
  });
});
