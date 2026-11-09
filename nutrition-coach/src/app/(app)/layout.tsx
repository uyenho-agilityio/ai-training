import { connection } from "next/server";

import { Header } from "@/components";
import { hasProfile } from "@/utils/supabase/queries/profile";
import { requireUser } from "@/utils/supabase/requireUser";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const user = await requireUser();
  const withProfile = await hasProfile(user.id);

  return (
    <>
      <Header hasProfile={withProfile} />
      {children}
    </>
  );
}
