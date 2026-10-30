import { redirect } from "next/navigation";
import { connection } from "next/server";

import { EntryList, FoodPicker, Heading, TotalsCards } from "@/components";
import { calculateDailyTotals } from "@/utils/dailyTotals";
import { getProfile, hasProfile } from "@/utils/supabase/queries/profile";
import { listEntries } from "@/utils/supabase/queries/meals";
import { requireUser } from "@/utils/supabase/requireUser";
import { calculateTargets } from "@/utils/targets";
import { todayInVietnam } from "@/utils/todayInVietnam";

export const instant = false;

export default async function TodayPage() {
  await connection();
  const user = await requireUser();

  if (!(await hasProfile(user.id))) {
    redirect("/profile");
  }

  const profile = await getProfile(user.id);
  if (profile === null) {
    redirect("/profile");
  }

  const target = calculateTargets(profile);
  const entries = await listEntries(user.id, todayInVietnam(new Date()));
  const { eaten, remaining } = calculateDailyTotals(target, entries);

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <Heading tone="primary">Today</Heading>
      <div className="flex w-full max-w-md flex-col gap-6">
        <TotalsCards target={target} eaten={eaten} remaining={remaining} />
        <FoodPicker />
        <EntryList entries={entries} />
      </div>
    </main>
  );
}
