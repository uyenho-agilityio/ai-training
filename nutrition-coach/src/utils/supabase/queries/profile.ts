import type { ProfileInput } from "@/schemas/profile";

import { createClient } from "../server";

export async function hasProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read profile: ${error.message}`);
  }

  return data !== null;
}

export async function getProfile(userId: string): Promise<ProfileInput | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("sex, age, height_cm, weight_kg, activity_level, body_fat_percent")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read profile: ${error.message}`);
  }

  if (data === null) {
    return null;
  }

  return {
    sex: data.sex,
    age: data.age,
    heightCm: Number(data.height_cm),
    weightKg: Number(data.weight_kg),
    activityLevel: data.activity_level,
    bodyFatPercent:
      data.body_fat_percent === null ? null : Number(data.body_fat_percent),
  };
}
