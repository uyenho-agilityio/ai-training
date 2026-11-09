import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "@/components/Header";

vi.mock("@/app/actions/auth", () => ({
  signOut: vi.fn(),
}));

const navigation = vi.hoisted(() => ({ pathname: "/today" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
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
    render(<Header hasProfile />);

    expect(
      within(screen.getByRole("banner")).getByRole("button", {
        name: "Sign out",
      }),
    ).toBeInTheDocument();
  });

  it("shows the theme switch in the page header", () => {
    render(<Header hasProfile />);

    expect(
      within(screen.getByRole("banner")).getByRole("group", {
        name: "Theme",
      }),
    ).toBeInTheDocument();
  });

  it("links to the Profile page from the page header", () => {
    render(<Header hasProfile />);

    expect(
      within(screen.getByRole("banner")).getByRole("link", {
        name: "Profile",
      }),
    ).toHaveAttribute("href", "/profile");
  });

  it("links to Today from the page header when there is a profile", () => {
    navigation.pathname = "/profile";
    render(<Header hasProfile />);

    expect(
      within(screen.getByRole("banner")).getByRole("link", { name: "Today" }),
    ).toHaveAttribute("href", "/today");
  });

  it("does not link to Today when there is no profile", () => {
    render(<Header hasProfile={false} />);

    expect(
      within(screen.getByRole("banner")).queryByRole("link", { name: "Today" }),
    ).toBeNull();
  });
});
