import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Header } from "@/components/Header";

vi.mock("@/app/actions/auth", () => ({
  signOut: vi.fn(),
}));

describe("Header", () => {
  it("shows the sign-out button in the page header", () => {
    render(<Header />);

    expect(
      screen.getByRole("banner").querySelector("button"),
    ).toHaveTextContent("Sign out");
  });
});
