import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeSwitch } from "@/components/ThemeSwitch";
import { useThemeStore } from "@/stores/useThemeStore";

let systemPrefersDark = false;

describe("ThemeSwitch", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "system" });
    delete document.documentElement.dataset.theme;
    systemPrefersDark = false;
    window.matchMedia = vi.fn().mockImplementation(() => ({
      get matches() {
        return systemPrefersDark;
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
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
