import { Suspense } from "react";
import { connection } from "next/server";

import { requireUser } from "@/utils/supabase/requireUser";

async function ProfileGate() {
  await connection();
  const user = await requireUser();
  const name: string = user.user_metadata.full_name ?? user.email ?? "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-3xl font-semibold text-primary">Profile</h1>
      <p className="text-lg font-semibold">{name}</p>
      <p>{user.email}</p>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileGate />
    </Suspense>
  );
}
