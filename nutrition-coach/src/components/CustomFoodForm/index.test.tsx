import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { addCustomFood } from "@/app/actions/foods";
import { CustomFoodForm } from "@/components/CustomFoodForm";

const refresh = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/foods", () => ({
  addCustomFood: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

async function fillFood(
  user: ReturnType<typeof userEvent.setup>,
  values: { name?: string; kcal?: string },
) {
  await user.type(screen.getByLabelText("Name"), values.name ?? "Pho");
  await user.type(screen.getByLabelText("Calories (kcal)"), values.kcal ?? "400");
  await user.type(screen.getByLabelText("Protein (g)"), "25");
  await user.type(screen.getByLabelText("Carbs (g)"), "50");
  await user.type(screen.getByLabelText("Fat (g)"), "10");
}

describe("CustomFoodForm", () => {
  beforeEach(() => {
    vi.mocked(addCustomFood).mockReset();
    refresh.mockReset();
  });

  it("shows an error and does not save when the name is empty", async () => {
    const user = userEvent.setup();
    render(<CustomFoodForm />);

    await fillFood(user, { name: " " });
    await user.click(screen.getByRole("button", { name: "Save food" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Name is required",
    );
    expect(addCustomFood).not.toHaveBeenCalled();
  });

  it("shows an error and does not save when a value is negative", async () => {
    const user = userEvent.setup();
    render(<CustomFoodForm />);

    await fillFood(user, { kcal: "-5" });
    await user.click(screen.getByRole("button", { name: "Save food" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Values cannot be negative",
    );
    expect(addCustomFood).not.toHaveBeenCalled();
  });

  it("saves a valid food and refreshes the list", async () => {
    vi.mocked(addCustomFood).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<CustomFoodForm />);

    await fillFood(user, {});
    await user.click(screen.getByRole("button", { name: "Save food" }));

    expect(addCustomFood).toHaveBeenCalledWith({
      name: "Pho",
      kcal: 400,
      proteinG: 25,
      carbG: 50,
      fatG: 10,
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the message from the server when the save is rejected", async () => {
    vi.mocked(addCustomFood).mockResolvedValue({
      ok: false,
      message: "Name is required",
    });
    const user = userEvent.setup();
    render(<CustomFoodForm />);

    await fillFood(user, {});
    await user.click(screen.getByRole("button", { name: "Save food" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Name is required",
    );
    expect(refresh).not.toHaveBeenCalled();
  });
});
