import { describe, expect, it } from "vitest";

import { FOODS } from "@/constants/foods";

// Values come from docs/requirements/food-list.md (first entry per dish).
describe("FOODS", () => {
  it("has exactly 20 built-in dishes", () => {
    expect(FOODS).toHaveLength(20);
  });

  it("has unique codes", () => {
    const codes = FOODS.map((food) => food.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("does not include Canh bí đao nấu sườn lợn (VPF-000019)", () => {
    expect(FOODS.some((food) => food.code === "VPF-000019")).toBe(false);
  });

  it("copies the values of Cơm hến from the food list", () => {
    expect(FOODS.find((food) => food.code === "VPF-000008")).toEqual({
      code: "VPF-000008",
      nameVi: "Cơm hến",
      nameEn: "Baby clam rice",
      mealTypes: ["lunch", "dinner"],
      kcal: 291,
      proteinG: 18,
      fatG: 6.3,
      carbG: 40.1,
    });
  });

  it("flags only the two estimated carb values", () => {
    const estimates = FOODS.filter((food) => food.isEstimate).map(
      (food) => food.code,
    );
    expect(estimates.sort()).toEqual(["VPF-000094", "VPF-000193"]);
  });

  it("sets carb 0 for Thịt gà luộc and carb 4 for Gà xào sả", () => {
    expect(FOODS.find((food) => food.code === "VPF-000094")).toMatchObject({
      carbG: 0,
      isEstimate: true,
    });
    expect(FOODS.find((food) => food.code === "VPF-000193")).toMatchObject({
      carbG: 4,
      isEstimate: true,
    });
  });
});
