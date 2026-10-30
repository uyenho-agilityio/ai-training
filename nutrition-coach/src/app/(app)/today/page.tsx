import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { Heading } from "@/components";
import { hasProfile } from "@/utils/supabase/queries/profile";
import { requireUser } from "@/utils/supabase/requireUser";

async function TodayGate() {
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

export default function TodayPage() {
  return (
    <Suspense>
      <TodayGate />
    </Suspense>
  );
}
