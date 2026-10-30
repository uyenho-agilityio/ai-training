import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { logCustomFood } from "@/app/actions/foods";
import { CustomFoodList } from "@/components/CustomFoodList";

const refresh = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/foods", () => ({
  logCustomFood: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const savedFoods = [
  {
    id: "3f6c2a1e-8b7d-4e2a-9c1f-5a4b3d2e1f00",
    name: "Mom's chicken soup",
    kcal: 210,
    proteinG: 18,
    carbG: 12,
    fatG: 9,
  },
  {
    id: "7a1b9c2d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    name: "Egg toast",
    kcal: 320,
    proteinG: 14,
    carbG: 30,
    fatG: 15,
  },
];

describe("CustomFoodList", () => {
  beforeEach(() => {
    vi.mocked(logCustomFood).mockReset();
    refresh.mockReset();
  });

  it("shows an empty message when no food is saved", () => {
    render(<CustomFoodList foods={[]} />);

    expect(screen.getByText("No saved foods yet")).toBeInTheDocument();
  });

  it("shows each saved food with its calories", () => {
    render(<CustomFoodList foods={savedFoods} />);

    const row = screen.getByRole("listitem", { name: "Egg toast" });
    expect(within(row).getByText("320 kcal")).toBeInTheDocument();
    expect(screen.getByText("Mom's chicken soup")).toBeInTheDocument();
  });

  it("logs the food the user chose and refreshes the day", async () => {
    vi.mocked(logCustomFood).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<CustomFoodList foods={savedFoods} />);

    await user.click(screen.getByRole("button", { name: "Log Egg toast" }));

    expect(logCustomFood).toHaveBeenCalledWith({
      customFoodId: "7a1b9c2d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("shows an error when the log is rejected", async () => {
    vi.mocked(logCustomFood).mockResolvedValue({
      ok: false,
      message: "Choose a food",
    });
    const user = userEvent.setup();
    render(<CustomFoodList foods={savedFoods} />);

    await user.click(screen.getByRole("button", { name: "Log Egg toast" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Choose a food");
    expect(refresh).not.toHaveBeenCalled();
  });
});
