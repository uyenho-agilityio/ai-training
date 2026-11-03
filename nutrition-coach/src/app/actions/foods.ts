"use server";

import { z } from "zod";

import { customFoodSchema, type CustomFoodInput } from "@/schemas/customFood";
import { getCustomFood, insertCustomFood } from "@/utils/supabase/queries/customFoods";
import { requireUser } from "@/utils/supabase/requireUser";
import { createClient } from "@/utils/supabase/server";
import { todayInVietnam } from "@/utils/todayInVietnam";

export type AddCustomFoodResult =
  { ok: true } | { ok: false; message: string };

export type LogCustomFoodResult =
  { ok: true } | { ok: false; message: string };

const logCustomFoodSchema = z.object({
  customFoodId: z.uuid(),
});

export async function addCustomFood(
  input: CustomFoodInput,
): Promise<AddCustomFoodResult> {
  const user = await requireUser();
  const parsed = customFoodSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  await insertCustomFood(user.id, parsed.data);
  return { ok: true };
}

export async function logCustomFood(input: {
  customFoodId: string;
}): Promise<LogCustomFoodResult> {
  const user = await requireUser();
  const parsed = logCustomFoodSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Choose a food" };
  }

  const food = await getCustomFood(user.id, parsed.data.customFoodId);

  if (!food) {
    return { ok: false, message: "Choose a food" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("meal_entries").insert({
    user_id: user.id,
    entry_date: todayInVietnam(new Date()),
    custom_food_id: food.id,
    name: food.name,
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
