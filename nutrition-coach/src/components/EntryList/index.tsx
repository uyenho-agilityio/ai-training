"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteMealEntry } from "@/app/actions/mealEntries";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";

export type EntryListItem = {
  id: string;
  name: string;
  kcal: number;
};

type EntryListProps = {
  entries: EntryListItem[];
};

export function EntryList({ entries }: EntryListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (entries.length === 0) {
    return <Text tone="muted">Nothing logged yet today.</Text>;
  }

  async function handleDelete(entryId: string) {
    setPendingId(entryId);
    let result;
    try {
      result = await deleteMealEntry({ entryId });
    } catch {
      setPendingId(null);
      setError("Could not delete the entry. Try again.");
      return;
    }
    setPendingId(null);

    if (result.ok) {
      setError(null);
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-4"
          >
            <Text>{entry.name}</Text>
            <div className="flex items-center gap-3">
              <Text>{Math.round(entry.kcal)} kcal</Text>
              <Button
                variant="outline"
                aria-label={`Delete ${entry.name}`}
                disabled={pendingId !== null}
                onClick={() => handleDelete(entry.id)}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {error ? (
        <div role="alert">
          <Text tone="primary">{error}</Text>
        </div>
      ) : null}
    </div>
  );
}
