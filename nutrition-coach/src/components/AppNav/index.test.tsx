import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppNav } from "@/components/AppNav";

const navigation = vi.hoisted(() => ({ pathname: "/today" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

describe("AppNav", () => {
  beforeEach(() => {
    navigation.pathname = "/today";
  });

  it("shows Profile, but not Today, on the Today page", () => {
    render(<AppNav hasProfile />);

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.queryByRole("link", { name: "Today" })).toBeNull();
  });

  it("shows Today, but not Profile, on the Profile page", () => {
    navigation.pathname = "/profile";
    render(<AppNav hasProfile />);

    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute(
      "href",
      "/today",
    );
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });

  it("hides Today for a user without a profile", () => {
    navigation.pathname = "/profile";
    render(<AppNav hasProfile={false} />);

    expect(screen.queryByRole("link", { name: "Today" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });
});
