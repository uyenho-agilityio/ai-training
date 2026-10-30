import { connection } from "next/server";

import { Heading, Text } from "@/components";
import { requireUser } from "@/utils/supabase/requireUser";

export const instant = false;

export default async function ProfilePage() {
  await connection();
  const user = await requireUser();
  const name: string = user.user_metadata.full_name ?? user.email ?? "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6">
      <Heading tone="primary">Profile</Heading>
      <Text size="lg" weight="semibold">
        {name}
      </Text>
      <Text>{user.email}</Text>
    </main>
  );
}
