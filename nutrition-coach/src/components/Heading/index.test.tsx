import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Heading } from "@/components/Heading";

describe("Heading", () => {
  it("shows its text as a heading at the given level", () => {
    render(<Heading level={2}>Profile</Heading>);

    expect(
      screen.getByRole("heading", { level: 2, name: "Profile" }),
    ).toBeInTheDocument();
  });

  it("uses level 1 when no level is given", () => {
    render(<Heading>Today</Heading>);

    expect(
      screen.getByRole("heading", { level: 1, name: "Today" }),
    ).toBeInTheDocument();
  });
});
