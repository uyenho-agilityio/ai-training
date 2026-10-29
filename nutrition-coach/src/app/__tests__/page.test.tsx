import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("shows the app name as the main heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Nutrition Coach" }),
    ).toBeInTheDocument();
  });
});
