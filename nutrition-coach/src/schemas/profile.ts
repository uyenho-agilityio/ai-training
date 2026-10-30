import { z } from "zod";

import { BODY_FAT_PERCENT_RANGE } from "@/constants/nutrition";

export const profileSchema = z.object({
  sex: z.enum(["male", "female"], { error: "Choose male or female" }),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(10, "Age must be from 10 to 120")
    .max(120, "Age must be from 10 to 120"),
  heightCm: z
    .number({ error: "Height is required" })
    .min(100, "Height must be from 100 to 200 cm")
    .max(200, "Height must be from 100 to 200 cm"),
  weightKg: z
    .number({ error: "Weight is required" })
    .min(20, "Weight must be from 20 to 300 kg")
    .max(300, "Weight must be from 20 to 300 kg"),
  activityLevel: z.enum(
    ["sedentary", "light", "moderate", "active", "very_active"],
    { error: "Choose an activity level" },
  ),
  bodyFatPercent: z
    .number()
    .min(
      BODY_FAT_PERCENT_RANGE.min,
      `Body fat must be from ${BODY_FAT_PERCENT_RANGE.min} to ${BODY_FAT_PERCENT_RANGE.max}%`,
    )
    .max(
      BODY_FAT_PERCENT_RANGE.max,
      `Body fat must be from ${BODY_FAT_PERCENT_RANGE.min} to ${BODY_FAT_PERCENT_RANGE.max}%`,
    )
    .nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
