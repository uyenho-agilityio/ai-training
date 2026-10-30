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
  if (entries.length === 0) {
    return <Text tone="muted">Nothing logged yet today.</Text>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.id} className="flex justify-between gap-4">
          <Text>{entry.name}</Text>
          <Text>{Math.round(entry.kcal)} kcal</Text>
        </li>
      ))}
    </ul>
  );
}
