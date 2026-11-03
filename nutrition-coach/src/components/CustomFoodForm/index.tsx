"use client";

import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";

import { addCustomFood } from "@/app/actions/foods";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { customFoodSchema } from "@/schemas/customFood";

function readNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return Number.NaN;
  }
  return Number(value);
}

const fields = [
  { name: "kcal", label: "Calories (kcal)" },
  { name: "proteinG", label: "Protein (g)" },
  { name: "carbG", label: "Carbs (g)" },
  { name: "fatG", label: "Fat (g)" },
] as const;

export function CustomFoodForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const parsed = customFoodSchema.safeParse({
      name: formData.get("name") ?? "",
      kcal: readNumber(formData.get("kcal")),
      proteinG: readNumber(formData.get("proteinG")),
      carbG: readNumber(formData.get("carbG")),
      fatG: readNumber(formData.get("fatG")),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    let result;
    try {
      result = await addCustomFood(parsed.data);
    } catch {
      setPending(false);
      setError("Could not save the food. Try again.");
      return;
    }
    setPending(false);

    if (result.ok) {
      setError(null);
      form.reset();
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Name</span>
        <input
          name="name"
          type="text"
          className="rounded-field border border-primary/30 py-2 pr-3 pl-3"
        />
      </label>
      {fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1">
          <span className="text-sm font-semibold">{field.label}</span>
          <input
            name={field.name}
            type="number"
            min={0}
            step="any"
            className="rounded-field border border-primary/30 py-2 pr-3 pl-3"
          />
        </label>
      ))}
      {error ? (
        <div role="alert">
          <Text tone="primary">{error}</Text>
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        Save food
      </Button>
    </form>
  );
}
