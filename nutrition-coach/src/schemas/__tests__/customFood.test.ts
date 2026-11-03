import { describe, expect, it } from "vitest";

import { customFoodSchema } from "@/schemas/customFood";

const validFood = {
  name: "Mom's chicken soup",
  kcal: 210,
  proteinG: 18,
  carbG: 12,
  fatG: 9,
};

describe("customFoodSchema", () => {
  it("accepts a food with a name and non-negative values", () => {
    expect(customFoodSchema.safeParse(validFood).success).toBe(true);
  });

  it("accepts zero for every value", () => {
    expect(
      customFoodSchema.safeParse({
        name: "Water",
        kcal: 0,
        proteinG: 0,
        carbG: 0,
        fatG: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = customFoodSchema.safeParse({ ...validFood, name: "" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Name is required");
  });

  it("rejects a name that is only spaces", () => {
    const result = customFoodSchema.safeParse({ ...validFood, name: "   " });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Name is required");
  });

  it("trims the name", () => {
    const result = customFoodSchema.safeParse({
      ...validFood,
      name: "  Pho  ",
    });

    expect(result.success && result.data.name).toBe("Pho");
  });

  it.each(["kcal", "proteinG", "carbG", "fatG"] as const)(
    "rejects a negative %s",
    (field) => {
      const result = customFoodSchema.safeParse({ ...validFood, [field]: -1 });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Values cannot be negative");
    },
  );

  it.each(["kcal", "proteinG", "carbG", "fatG"] as const)(
    "rejects a missing %s",
    (field) => {
      const input: Record<string, unknown> = { ...validFood, [field]: NaN };
      const result = customFoodSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Enter a number");
    },
  );
});
