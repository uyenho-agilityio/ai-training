import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EntryList } from "@/components/EntryList";

const entries = [
  { id: "1", name: "Baby clam rice", kcal: 291 },
  { id: "2", name: "Boiled chicken", kcal: 577 },
];

describe("EntryList", () => {
  it("shows one row per logged food with its calories", () => {
    render(<EntryList entries={entries} />);

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("Baby clam rice")).toBeInTheDocument();
    expect(within(rows[0]).getByText("291 kcal")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Boiled chicken")).toBeInTheDocument();
  });

  it("says that nothing is logged yet on an empty day", () => {
    render(<EntryList entries={[]} />);

    expect(screen.getByText("Nothing logged yet today.")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
