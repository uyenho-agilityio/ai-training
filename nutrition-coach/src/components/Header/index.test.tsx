import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Header } from "@/components/Header";

vi.mock("@/app/actions/auth", () => ({
  signOut: vi.fn(),
}));

describe("Header", () => {
  it("shows the sign-out button in the page header", () => {
    render(<Header />);

    expect(
      within(screen.getByRole("banner")).getByRole("button", {
        name: "Sign out",
      }),
    ).toBeInTheDocument();
  });
});
