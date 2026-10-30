"use client";

import { useState, type SyntheticEvent } from "react";

import { saveProfile } from "@/app/actions/profile";
import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { Text } from "@/components/Text";
import { profileSchema, type ProfileInput } from "@/schemas/profile";
import type { Targets } from "@/utils/targets";

const activityOptions = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very_active", label: "Very active" },
];

type ProfileFormProps = {
  profile?: ProfileInput | null;
  target?: Targets | null;
};

function readNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return Number.NaN;
  }
  return Number(value);
}

export function ProfileForm({ profile, target }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [shownTarget, setShownTarget] = useState(target ?? null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bodyFat = formData.get("bodyFatPercent");
    const parsed = profileSchema.safeParse({
      sex: formData.get("sex"),
      age: readNumber(formData.get("age")),
      heightCm: readNumber(formData.get("heightCm")),
      weightKg: readNumber(formData.get("weightKg")),
      activityLevel: formData.get("activityLevel"),
      bodyFatPercent:
        typeof bodyFat === "string" && bodyFat.trim() !== ""
          ? readNumber(bodyFat)
          : null,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    const result = await saveProfile(parsed.data);
    setPending(false);

    if (result.ok) {
      setError(null);
      setShownTarget(result.target);
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold">Sex</legend>
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="sex"
                value="male"
                className="cursor-pointer"
                defaultChecked={profile?.sex === "male"}
              />
              Male
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="sex"
                value="female"
                className="cursor-pointer"
                defaultChecked={profile?.sex === "female"}
              />
              Female
            </label>
          </div>
        </fieldset>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Age</span>
          <input
            type="number"
            name="age"
            inputMode="numeric"
            defaultValue={profile?.age}
            className="rounded-field border border-primary/30 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Height (cm)</span>
          <input
            type="number"
            name="heightCm"
            inputMode="decimal"
            step="0.1"
            defaultValue={profile?.heightCm}
            className="rounded-field border border-primary/30 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Weight (kg)</span>
          <input
            type="number"
            name="weightKg"
            inputMode="decimal"
            step="0.1"
            defaultValue={profile?.weightKg}
            className="rounded-field border border-primary/30 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Activity level</span>
          <div className="relative">
            <select
              name="activityLevel"
              defaultValue={profile?.activityLevel ?? ""}
              className="w-full cursor-pointer appearance-none rounded-field border border-primary/30 py-2 pr-10 pl-3"
            >
              <option value="" disabled>
                Choose one
              </option>
              {activityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Body fat % (optional)</span>
          <input
            type="number"
            name="bodyFatPercent"
            inputMode="decimal"
            step="0.1"
            defaultValue={profile?.bodyFatPercent ?? ""}
            className="rounded-field border border-primary/30 px-3 py-2"
          />
        </label>

        {error ? (
          <div role="alert">
            <Text tone="primary">{error}</Text>
          </div>
        ) : null}

        <Button type="submit" disabled={pending}>
          Save profile
        </Button>
      </form>

      {shownTarget ? (
        <section className="flex flex-col gap-2">
          <Heading level={2} tone="primary">
            Daily target
          </Heading>
          <Text size="lg" weight="semibold">
            {shownTarget.kcal} kcal
          </Text>
          <Text>{shownTarget.proteinG} g protein</Text>
          <Text>{shownTarget.carbG} g carbs</Text>
          <Text>{shownTarget.fatG} g fat</Text>
        </section>
      ) : null}
    </div>
  );
}
