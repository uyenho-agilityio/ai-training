import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signOut } from "@/app/actions/auth";
import { SignOutButton } from "@/components/SignOutButton";

vi.mock("@/app/actions/auth", () => ({
  signOut: vi.fn(),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    vi.mocked(signOut).mockResolvedValue(undefined);
  });

  it("shows one button labelled Sign out", () => {
    render(<SignOutButton />);

    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });

  it("signs the user out when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
