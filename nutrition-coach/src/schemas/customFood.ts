import { z } from "zod";

const amount = z
  .number({ error: "Enter a number" })
  .nonnegative("Values cannot be negative");

export const customFoodSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  kcal: amount,
  proteinG: amount,
  carbG: amount,
  fatG: amount,
});

export type CustomFoodInput = z.infer<typeof customFoodSchema>;
