import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeSwitch } from "@/components/ThemeSwitch";
import { themeStorageKey, useThemeStore } from "@/stores/useThemeStore";

let systemPrefersDark = false;

describe("ThemeSwitch", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "system" });
    delete document.documentElement.dataset.theme;
    systemPrefersDark = false;
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        get matches() {
          return systemPrefersDark;
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("never shows the OS theme while a saved dark choice loads", async () => {
    localStorage.setItem(
      themeStorageKey,
      JSON.stringify({ state: { theme: "dark" }, version: 0 }),
    );
    systemPrefersDark = false;
    const records: MutationRecord[] = [];
    const observer = new MutationObserver((list) => records.push(...list));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
      attributeOldValue: true,
    });

    render(<ThemeSwitch />);
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe("dark"),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    observer.disconnect();

    // A light value written and then replaced by dark shows up as the oldValue of the later write.
    expect(records.map((record) => record.oldValue)).not.toContain("light");
  });

  it("offers light, dark and system, with system selected by default", () => {
    render(<ThemeSwitch />);

    expect(screen.getByRole("radio", { name: "Light" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Dark" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
  });

  it("sets data-theme to dark when dark is chosen", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await user.click(screen.getByRole("radio", { name: "Dark" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("sets data-theme to light when light is chosen", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await user.click(screen.getByRole("radio", { name: "Light" }));

    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("follows the OS setting while system is chosen", async () => {
    systemPrefersDark = true;
    render(<ThemeSwitch />);

    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe("dark"),
    );
  });
});
