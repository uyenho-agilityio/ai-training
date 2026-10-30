"use server";

import { profileSchema, type ProfileInput } from "@/schemas/profile";
import { calculateTargets, type Targets } from "@/utils/targets";
import { requireUser } from "@/utils/supabase/requireUser";
import { createClient } from "@/utils/supabase/server";

export type SaveProfileResult =
  { ok: true; target: Targets } | { ok: false; message: string };

export async function saveProfile(
  input: ProfileInput,
): Promise<SaveProfileResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const profile = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      sex: profile.sex,
      age: profile.age,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      activity_level: profile.activityLevel,
      body_fat_percent: profile.bodyFatPercent,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Could not save profile: ${error.message}`);
  }

  return { ok: true, target: calculateTargets(profile) };
}
