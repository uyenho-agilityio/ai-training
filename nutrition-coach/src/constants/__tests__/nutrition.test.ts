import { describe, expect, it } from "vitest";

import {
  ACTIVITY_FACTORS,
  BODY_FAT_PERCENT_RANGE,
  DEFICIT_KCAL,
  FAT_KCAL_PER_G,
  FAT_SHARE_OF_KCAL,
  KCAL_PER_G,
  PROTEIN_G_PER_KG,
} from "@/constants/nutrition";

describe("nutrition constants", () => {
  it("uses the five activity factors from the spec", () => {
    expect(ACTIVITY_FACTORS).toEqual({
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    });
  });

  it("sets the daily deficit to 500 kcal", () => {
    expect(DEFICIT_KCAL).toBe(500);
  });

  it("sets protein to 2 g per kg of body weight", () => {
    expect(PROTEIN_G_PER_KG).toBe(2);
  });

  it("sets fat to 25% of calories", () => {
    expect(FAT_SHARE_OF_KCAL).toBe(0.25);
  });

  it("uses 4 kcal per gram of protein and carbs and 9 kcal per gram of fat", () => {
    expect(KCAL_PER_G).toEqual({ protein: 4, carb: 4 });
    expect(FAT_KCAL_PER_G).toBe(9);
  });

  it("accepts body fat from 3% to 60%", () => {
    expect(BODY_FAT_PERCENT_RANGE).toEqual({ min: 3, max: 60 });
  });
});
