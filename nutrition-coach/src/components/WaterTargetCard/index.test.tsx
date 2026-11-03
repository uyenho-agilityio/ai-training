import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WaterTargetCard } from "@/components/WaterTargetCard";

describe("WaterTargetCard", () => {
  it("shows the daily water target in ml", () => {
    render(<WaterTargetCard targetMl={2750} />);

    expect(screen.getByText("Water target")).toBeInTheDocument();
    expect(screen.getByText("2,750 ml")).toBeInTheDocument();
  });
});
