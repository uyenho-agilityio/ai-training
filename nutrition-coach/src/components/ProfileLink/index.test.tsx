import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileLink } from "@/components/ProfileLink";

const navigation = vi.hoisted(() => ({ pathname: "/today" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

describe("ProfileLink", () => {
  beforeEach(() => {
    navigation.pathname = "/today";
  });

  it("links to the Profile page on other pages", () => {
    render(<ProfileLink />);

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
  });

  it("is hidden on the Profile page itself", () => {
    navigation.pathname = "/profile";
    render(<ProfileLink />);

    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });
});
