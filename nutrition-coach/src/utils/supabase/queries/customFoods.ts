import type { CustomFoodInput } from "@/schemas/customFood";

import { createClient } from "../server";

export type SavedCustomFood = {
  id: string;
  name: string;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
};

export async function listCustomFoods(
  userId: string,
): Promise<SavedCustomFood[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_foods")
    .select("id, name, kcal, protein_g, carb_g, fat_g")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not read custom foods: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    kcal: Number(row.kcal),
    proteinG: Number(row.protein_g),
    carbG: Number(row.carb_g),
    fatG: Number(row.fat_g),
  }));
}

export async function getCustomFood(
  userId: string,
  id: string,
): Promise<SavedCustomFood | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_foods")
    .select("id, name, kcal, protein_g, carb_g, fat_g")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read custom food: ${error.message}`);
  }

  if (data === null) {
    return null;
  }

  return {
    id: data.id as string,
    name: data.name as string,
    kcal: Number(data.kcal),
    proteinG: Number(data.protein_g),
    carbG: Number(data.carb_g),
    fatG: Number(data.fat_g),
  };
}

export async function insertCustomFood(
  userId: string,
  input: CustomFoodInput,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("custom_foods").insert({
    user_id: userId,
    name: input.name,
    kcal: input.kcal,
    protein_g: input.proteinG,
    carb_g: input.carbG,
    fat_g: input.fatG,
  });

  if (error) {
    throw new Error(`Could not save custom food: ${error.message}`);
  }
}
