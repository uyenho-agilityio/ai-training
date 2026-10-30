"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { requireUser } from "@/utils/supabase/requireUser";
import { createClient } from "@/utils/supabase/server";

export async function signInWithGoogle() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${protocol}://${host}/auth/callback`,
    },
  });

  if (error || !data.url) {
    throw new Error("Could not start Google sign-in");
  }

  redirect(data.url);
}

export async function signOut() {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Could not sign out");
  }

  redirect("/login");
}
