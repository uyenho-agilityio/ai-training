import { Suspense } from "react";

import { requireUser } from "@/utils/supabase/requireUser";

async function ProfileGate() {
  await requireUser();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <h1 className="text-3xl font-semibold text-primary">Profile</h1>
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
