import { connection } from "next/server";

import { CustomFoodForm, CustomFoodList, Heading } from "@/components";
import { listCustomFoods } from "@/utils/supabase/queries/customFoods";
import { requireUser } from "@/utils/supabase/requireUser";

export const instant = false;

export default async function AddFoodPage() {
  await connection();
  const user = await requireUser();
  const foods = await listCustomFoods(user.id);

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <Heading tone="primary">Add food</Heading>
      <div className="flex w-full max-w-md flex-col gap-6">
        <section className="flex flex-col gap-3">
          <Heading level={2}>New custom food</Heading>
          <CustomFoodForm />
        </section>
        <section className="flex flex-col gap-3">
          <Heading level={2}>Saved foods</Heading>
          <CustomFoodList foods={foods} />
        </section>
      </div>
    </main>
  );
}
