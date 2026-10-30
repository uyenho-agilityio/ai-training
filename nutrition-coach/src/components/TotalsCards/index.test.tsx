import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TotalsCards } from "@/components/TotalsCards";

const target = { kcal: 2211, proteinG: 160, carbG: 254, fatG: 61 };
const eaten = { kcal: 291, proteinG: 18, carbG: 40.1, fatG: 6.3 };
const remaining = { kcal: 1920, proteinG: 142, carbG: 213.9, fatG: 54.7 };

describe("TotalsCards", () => {
  it("shows the target, eaten and remaining calories as whole numbers", () => {
    render(<TotalsCards target={target} eaten={eaten} remaining={remaining} />);

    expect(screen.getByText("Target")).toBeInTheDocument();
    expect(screen.getByText("2211 kcal")).toBeInTheDocument();
    expect(screen.getByText("Eaten")).toBeInTheDocument();
    expect(screen.getByText("291 kcal")).toBeInTheDocument();
    expect(screen.getByText("Remaining")).toBeInTheDocument();
    expect(screen.getByText("1920 kcal")).toBeInTheDocument();
  });

  it("shows the remaining protein, carbs and fat", () => {
    render(<TotalsCards target={target} eaten={eaten} remaining={remaining} />);

    expect(screen.getByText("142 g protein left")).toBeInTheDocument();
    expect(screen.getByText("214 g carbs left")).toBeInTheDocument();
    expect(screen.getByText("55 g fat left")).toBeInTheDocument();
  });
});
