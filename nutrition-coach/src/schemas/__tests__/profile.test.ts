import { describe, expect, it } from "vitest";

import { profileSchema } from "@/schemas/profile";

const validProfile = {
  sex: "female",
  age: 25,
  heightCm: 160,
  weightKg: 55,
  activityLevel: "sedentary",
  bodyFatPercent: null,
};

describe("profileSchema", () => {
  it("accepts a valid profile without body fat %", () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("accepts a valid profile with body fat %", () => {
    expect(
      profileSchema.safeParse({ ...validProfile, bodyFatPercent: 22.5 })
        .success,
    ).toBe(true);
  });

  it("accepts the limits of each range", () => {
    expect(
      profileSchema.safeParse({
        ...validProfile,
        age: 120,
        heightCm: 100,
        weightKg: 300,
        bodyFatPercent: 3,
      }).success,
    ).toBe(true);
    expect(
      profileSchema.safeParse({
        ...validProfile,
        age: 10,
        heightCm: 200,
        weightKg: 20,
        bodyFatPercent: 60,
      }).success,
    ).toBe(true);
  });

  it.each([
    ["sex", { sex: "other" }],
    ["sex", { sex: undefined }],
    ["age", { age: 9 }],
    ["age", { age: 121 }],
    ["age", { age: 25.5 }],
    ["age", { age: NaN }],
    ["heightCm", { heightCm: 99 }],
    ["heightCm", { heightCm: 201 }],
    ["weightKg", { weightKg: 19.9 }],
    ["weightKg", { weightKg: 301 }],
    ["activityLevel", { activityLevel: "extreme" }],
    ["bodyFatPercent", { bodyFatPercent: 2.9 }],
    ["bodyFatPercent", { bodyFatPercent: 60.1 }],
  ])("rejects an invalid %s", (field, change) => {
    const result = profileSchema.safeParse({ ...validProfile, ...change });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toContain(field);
      expect(result.error.issues.every((issue) => issue.message)).toBe(true);
    }
  });
});
