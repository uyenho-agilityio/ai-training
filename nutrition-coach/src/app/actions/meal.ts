"use server";

import { z } from "zod";

import { FOODS } from "@/constants/foods";
import { requireUser } from "@/utils/supabase/requireUser";
import { createClient } from "@/utils/supabase/server";
import { todayInVietnam } from "@/utils/todayInVietnam";

const logFoodSchema = z.object({
  foodCode: z.string(),
});

export type LogFoodResult = { ok: true } | { ok: false; message: string };

export async function logFood(input: {
  foodCode: string;
}): Promise<LogFoodResult> {
  const user = await requireUser();
  const parsed = logFoodSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Choose a dish" };
  }

  const food = FOODS.find((item) => item.code === parsed.data.foodCode);

  if (!food) {
    return { ok: false, message: "Choose a dish" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("meal_entries").insert({
    user_id: user.id,
    entry_date: todayInVietnam(new Date()),
    food_code: food.code,
    name: food.nameEn,
    kcal: food.kcal,
    protein_g: food.proteinG,
    carb_g: food.carbG,
    fat_g: food.fatG,
  });

  if (error) {
    throw new Error(`Could not log food: ${error.message}`);
  }

  return { ok: true };
}
