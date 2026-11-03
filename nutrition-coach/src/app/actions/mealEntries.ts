"use server";

import { z } from "zod";

import { requireUser } from "@/utils/supabase/requireUser";
import { createClient } from "@/utils/supabase/server";
import { todayInVietnam } from "@/utils/todayInVietnam";

const deleteMealEntrySchema = z.object({
  entryId: z.uuid(),
});

export type DeleteMealEntryResult =
  { ok: true } | { ok: false; message: string };

export async function deleteMealEntry(input: {
  entryId: string;
}): Promise<DeleteMealEntryResult> {
  const user = await requireUser();
  const parsed = deleteMealEntrySchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Could not delete this entry" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_entries")
    .delete()
    .eq("id", parsed.data.entryId)
    .eq("user_id", user.id)
    .eq("entry_date", todayInVietnam(new Date()))
    .select("id");

  if (error) {
    throw new Error(`Could not delete entry: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return { ok: false, message: "Could not delete this entry" };
  }

  return { ok: true };
}
