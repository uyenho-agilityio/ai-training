import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInWithGoogle } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

vi.mock("@/app/actions/auth", () => ({
  signInWithGoogle: vi.fn(),
}));

describe("GoogleSignInButton", () => {
  beforeEach(() => {
    vi.mocked(signInWithGoogle).mockResolvedValue(undefined);
  });

  it("shows one button labelled Continue with Google", () => {
    render(<GoogleSignInButton />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
  });

  it("starts Google sign-in when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<GoogleSignInButton />);

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
