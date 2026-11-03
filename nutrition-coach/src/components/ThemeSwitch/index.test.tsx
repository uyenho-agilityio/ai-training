import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeSwitch } from "@/components/ThemeSwitch";
import { themeStorageKey, useThemeStore } from "@/stores/useThemeStore";

let systemPrefersDark = false;

describe("ThemeSwitch", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: null });
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

  it("offers only light and dark", () => {
    render(<ThemeSwitch />);

    expect(screen.getByRole("radio", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Dark" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "System" })).toBeNull();
  });

  it("shows dark as selected when the device is dark and nothing is saved", async () => {
    systemPrefersDark = true;
    render(<ThemeSwitch />);

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked(),
    );
    expect(screen.getByRole("radio", { name: "Light" })).not.toBeChecked();
  });

  it("shows light as selected when the device is light and nothing is saved", async () => {
    systemPrefersDark = false;
    render(<ThemeSwitch />);

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Light" })).toBeChecked(),
    );
    expect(screen.getByRole("radio", { name: "Dark" })).not.toBeChecked();
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

  it("follows the device setting until the user picks a theme", async () => {
    systemPrefersDark = true;
    render(<ThemeSwitch />);

    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe("dark"),
    );
  });

  it("never shows the device theme while a saved dark choice loads", async () => {
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
});
