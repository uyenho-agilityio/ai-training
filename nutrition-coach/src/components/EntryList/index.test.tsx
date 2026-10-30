import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteMealEntry } from "@/app/actions/mealEntries";
import { EntryList } from "@/components/EntryList";

const refresh = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/mealEntries", () => ({
  deleteMealEntry: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const entries = [
  { id: "1", name: "Baby clam rice", kcal: 291 },
  { id: "2", name: "Boiled chicken", kcal: 577 },
];

describe("EntryList", () => {
  beforeEach(() => {
    vi.mocked(deleteMealEntry).mockReset();
    refresh.mockReset();
  });

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

  it("deletes the row the user chose and refreshes the day", async () => {
    vi.mocked(deleteMealEntry).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<EntryList entries={entries} />);

    await user.click(
      screen.getByRole("button", { name: "Delete Boiled chicken" }),
    );

    expect(deleteMealEntry).toHaveBeenCalledWith({ entryId: "2" });
    expect(refresh).toHaveBeenCalled();
  });

  it("keeps the row and shows an error when the delete is rejected", async () => {
    vi.mocked(deleteMealEntry).mockResolvedValue({
      ok: false,
      message: "Could not delete this entry",
    });
    const user = userEvent.setup();
    render(<EntryList entries={entries} />);

    await user.click(
      screen.getByRole("button", { name: "Delete Baby clam rice" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not delete this entry",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(refresh).not.toHaveBeenCalled();
  });
});
