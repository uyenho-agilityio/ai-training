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
