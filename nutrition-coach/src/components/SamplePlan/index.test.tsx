import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { logFood } from "@/app/actions/meal";
import { SamplePlan } from "@/components/SamplePlan";
import type {
  SamplePlan as SamplePlanData,
  SamplePlanDay,
} from "@/utils/samplePlan";
import { FOODS } from "@/constants/foods";

vi.mock("@/app/actions/meal", () => ({
  logFood: vi.fn(),
}));

const food = (code: string) => {
  const found = FOODS.find((item) => item.code === code);
  if (!found) throw new Error(`missing ${code}`);
  return found;
};

// Values from docs/requirements/food-list.md: 225, 616, 167 kcal.
const dayOne: SamplePlanDay = {
  meals: [
    { mealType: "breakfast", food: food("VPF-000243") },
    { mealType: "lunch", food: food("VPF-000008") },
    { mealType: "dinner", food: food("VPF-000009") },
  ],
  kcal: 225 + 291 + 623,
};

const dayTwo: SamplePlanDay = {
  meals: [
    { mealType: "breakfast", food: food("VPF-000243") },
    { mealType: "lunch", food: food("VPF-000013") },
    { mealType: "dinner", food: food("VPF-000214") },
  ],
  kcal: 225 + 616 + 167,
};

const plan: SamplePlanData = {
  days: Array.from({ length: 7 }, (_, index) =>
    index % 2 === 0 ? dayOne : dayTwo,
  ),
};

describe("SamplePlan", () => {
  beforeEach(() => {
    vi.mocked(logFood).mockReset();
  });

  it("shows seven days to choose from", () => {
    render(<SamplePlan target={1800} plan={plan} />);

    for (let day = 1; day <= 7; day++) {
      expect(
        screen.getByRole("button", { name: `Day ${day}` }),
      ).toBeInTheDocument();
    }
  });

  it("shows three meals and the day's total against the target", () => {
    render(<SamplePlan target={1800} plan={plan} />);

    expect(screen.getByText("Breakfast")).toBeInTheDocument();
    expect(screen.getByText("Baby clam rice")).toBeInTheDocument();
    expect(screen.getByText("Mixed fried rice")).toBeInTheDocument();
    expect(screen.getByText("Chicken congee")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();
    expect(
      screen.getByText("1139 kcal of 1800 kcal target"),
    ).toBeInTheDocument();
  });

  it("switches to the chosen day's meals and total", async () => {
    const user = userEvent.setup();
    render(<SamplePlan target={1800} plan={plan} />);

    await user.click(screen.getByRole("button", { name: "Day 2" }));

    expect(screen.getByText("Pork rib rice")).toBeInTheDocument();
    expect(
      screen.getByText("Thick noodle soup with perch"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Mixed fried rice")).not.toBeInTheDocument();
    expect(
      screen.getByText("1008 kcal of 1800 kcal target"),
    ).toBeInTheDocument();
  });

  it("logs nothing when a plan day is chosen", async () => {
    const user = userEvent.setup();
    render(<SamplePlan target={1800} plan={plan} />);

    await user.click(screen.getByRole("button", { name: "Day 2" }));

    expect(logFood).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: /log|add/i }),
    ).not.toBeInTheDocument();
  });
});
