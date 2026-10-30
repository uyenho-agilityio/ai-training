import { describe, expect, it } from "vitest";

import { calculateTargets } from "@/utils/targets";

// Expected values are worked out by hand from the spec:
// Mifflin-St Jeor: 10 × kg + 6.25 × cm − 5 × age + 5 (male), − 161 (female)
// Katch-McArdle: 370 + 21.6 × lean mass kg, lean mass = kg × (1 − body fat %)
// TDEE = BMR × activity factor, target = TDEE − 500 kcal.
// Protein 2 g/kg; fat 25% of kcal ÷ 9; carbs = rest ÷ 4; whole numbers.

describe("calculateTargets", () => {
  it("uses Mifflin-St Jeor for a male with no body fat %", () => {
    // BMR 1748.75 × 1.55 = 2710.56 − 500 = 2210.56
    expect(
      calculateTargets({
        sex: "male",
        age: 30,
        heightCm: 175,
        weightKg: 80,
        activityLevel: "moderate",
        bodyFatPercent: null,
      }),
    ).toEqual({ kcal: 2211, proteinG: 160, carbG: 254, fatG: 61 });
  });

  it("uses Katch-McArdle when body fat % is set", () => {
    // Lean mass 42.9 kg, BMR 1296.64 × 1.2 = 1555.97 − 500 = 1055.97
    expect(
      calculateTargets({
        sex: "female",
        age: 25,
        heightCm: 160,
        weightKg: 55,
        activityLevel: "sedentary",
        bodyFatPercent: 22,
      }),
    ).toEqual({ kcal: 1056, proteinG: 110, carbG: 88, fatG: 29 });
  });

  it("uses Mifflin-St Jeor for a female when body fat % is not set", () => {
    // BMR 1264 × 1.2 = 1516.8 − 500 = 1016.8
    expect(
      calculateTargets({
        sex: "female",
        age: 25,
        heightCm: 160,
        weightKg: 55,
        activityLevel: "sedentary",
        bodyFatPercent: null,
      }),
    ).toEqual({ kcal: 1017, proteinG: 110, carbG: 81, fatG: 28 });
  });

  it.each([
    ["sedentary", 1561],
    ["light", 1862],
    ["moderate", 2162],
    ["active", 2463],
    ["very_active", 2763],
  ] as const)("applies the %s activity factor", (activityLevel, kcal) => {
    // Male, 30 years, 170 cm, 80 kg: BMR 1717.5
    expect(
      calculateTargets({
        sex: "male",
        age: 30,
        heightCm: 170,
        weightKg: 80,
        activityLevel,
        bodyFatPercent: null,
      }).kcal,
    ).toBe(kcal);
  });

  it("sets carbs to 0 when protein and fat already use all the kcal", () => {
    // Female, 100 years, 140 cm, 150 kg, sedentary: BMR 1714 × 1.2 = 2056.8 − 500
    // = 1556.8 kcal; protein 1200 kcal and fat 389.2 kcal leave −32.4 kcal for carbs
    expect(
      calculateTargets({
        sex: "female",
        age: 100,
        heightCm: 140,
        weightKg: 150,
        activityLevel: "sedentary",
        bodyFatPercent: null,
      }),
    ).toEqual({ kcal: 1557, proteinG: 300, carbG: 0, fatG: 43 });
  });
});
