import { createClient } from "../server";

export async function listEntries(userId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_entries")
    .select("id, name, kcal, protein_g, carb_g, fat_g")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not read entries: ${error.message}`);
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
