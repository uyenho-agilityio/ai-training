import { connection } from "next/server";

import { Heading, ProfileForm } from "@/components";
import { getProfile } from "@/utils/supabase/queries/profile";
import { requireUser } from "@/utils/supabase/requireUser";
import { calculateTargets } from "@/utils/targets";

export const instant = false;

export default async function ProfilePage() {
  await connection();
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const target = profile === null ? null : calculateTargets(profile);

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <Heading tone="primary">Profile</Heading>
      <ProfileForm profile={profile} target={target} />
    </main>
  );
}
