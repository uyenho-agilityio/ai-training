import { describe, expect, it } from "vitest";

import { FOODS, type MealType } from "@/constants/foods";
import { generateSamplePlan } from "@/utils/samplePlan";

// Mulberry32: a fixed random source, so every run gives the same plan.
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

describe("generateSamplePlan", () => {
  it("returns seven days, each with breakfast, lunch and dinner in order", () => {
    const plan = generateSamplePlan(1800, seededRandom(1));

    expect(plan.days).toHaveLength(7);
    for (const day of plan.days) {
      expect(day.meals.map((meal) => meal.mealType)).toEqual(MEAL_ORDER);
    }
  });

  it("picks each meal from dishes that are listed for that meal type", () => {
    const plan = generateSamplePlan(1800, seededRandom(2));

    for (const day of plan.days) {
      for (const meal of day.meals) {
        expect(meal.food.mealTypes).toContain(meal.mealType);
        expect(FOODS).toContainEqual(meal.food);
      }
    }
  });

  it("never repeats a dish within the same day", () => {
    const plan = generateSamplePlan(1800, seededRandom(3));

    for (const day of plan.days) {
      const codes = day.meals.map((meal) => meal.food.code);
      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  it("keeps every day within 10% of a reachable target, for many seeds", () => {
    const target = 1800;

    for (let seed = 1; seed <= 20; seed++) {
      const plan = generateSamplePlan(target, seededRandom(seed));

      for (const day of plan.days) {
        expect(day.kcal).toBeGreaterThanOrEqual(target * 0.9);
        expect(day.kcal).toBeLessThanOrEqual(target * 1.1);
      }
    }
  });

  it("returns the same plan for the same random source", () => {
    const first = generateSamplePlan(1800, seededRandom(6));
    const second = generateSamplePlan(1800, seededRandom(6));

    expect(second).toEqual(first);
  });
});
