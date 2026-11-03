import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "@/components/Header";

vi.mock("@/app/actions/auth", () => ({
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
}));

describe("Header", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the sign-out button in the page header", () => {
    render(<Header />);

    expect(
      within(screen.getByRole("banner")).getByRole("button", {
        name: "Sign out",
      }),
    ).toBeInTheDocument();
  });

  it("shows the theme switch in the page header", () => {
    render(<Header />);

    expect(
      within(screen.getByRole("banner")).getByRole("group", {
        name: "Theme",
      }),
    ).toBeInTheDocument();
  });

  it("links to the Profile page from the page header", () => {
    render(<Header />);

    expect(
      within(screen.getByRole("banner")).getByRole("link", {
        name: "Profile",
      }),
    ).toHaveAttribute("href", "/profile");
  });
});
