import { redirect } from "next/navigation";
import { connection } from "next/server";

import { hasProfile } from "@/utils/supabase/queries/profile";
import { Heading } from "@/components";
import { requireUser } from "@/utils/supabase/requireUser";

export const instant = false;

export default async function TodayPage() {
  await connection();
  const user = await requireUser();

  if (!(await hasProfile(user.id))) {
    redirect("/profile");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Heading tone="primary">Today</Heading>
    </main>
  );
}
