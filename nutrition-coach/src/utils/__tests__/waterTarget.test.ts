import { describe, expect, it } from "vitest";

import { calculateWaterTarget } from "@/utils/waterTarget";

describe("calculateWaterTarget", () => {
  it("adds nothing for light activity: 70 kg is 2,450 ml", () => {
    expect(calculateWaterTarget({ weightKg: 70, activityLevel: "light" })).toBe(
      2450,
    );
  });

  it("adds 300 ml for moderate activity: 70 kg is 2,750 ml", () => {
    expect(
      calculateWaterTarget({ weightKg: 70, activityLevel: "moderate" }),
    ).toBe(2750);
  });

  it("adds 500 ml for active: 80 kg is 3,300 ml", () => {
    expect(
      calculateWaterTarget({ weightKg: 80, activityLevel: "active" }),
    ).toBe(3300);
  });

  it("adds 500 ml for very active: 80 kg is 3,300 ml", () => {
    expect(
      calculateWaterTarget({ weightKg: 80, activityLevel: "very_active" }),
    ).toBe(3300);
  });

  it("adds nothing for sedentary: 70 kg is 2,450 ml", () => {
    expect(
      calculateWaterTarget({ weightKg: 70, activityLevel: "sedentary" }),
    ).toBe(2450);
  });

  it("rounds to whole ml: 70.5 kg light is 2,468 ml", () => {
    expect(
      calculateWaterTarget({ weightKg: 70.5, activityLevel: "light" }),
    ).toBe(2468);
  });
});
