import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { logFood } from "@/app/actions/meal";
import { FoodPicker } from "@/components/FoodPicker";

const refresh = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/meal", () => ({
  logFood: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("FoodPicker", () => {
  beforeEach(() => {
    vi.mocked(logFood).mockReset();
    refresh.mockReset();
  });

  it("logs the dish the user picked and refreshes the day", async () => {
    vi.mocked(logFood).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<FoodPicker />);

    await user.selectOptions(screen.getByLabelText("Dish"), "Baby clam rice");
    await user.click(screen.getByRole("button", { name: "Log dish" }));

    expect(logFood).toHaveBeenCalledWith({ foodCode: "VPF-000008" });
    expect(refresh).toHaveBeenCalled();
  });

  it("shows an error when the log is rejected", async () => {
    vi.mocked(logFood).mockResolvedValue({
      ok: false,
      message: "Choose a dish",
    });
    const user = userEvent.setup();
    render(<FoodPicker />);

    await user.click(screen.getByRole("button", { name: "Log dish" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Choose a dish");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("shows an error and enables Log dish again when the request fails", async () => {
    vi.mocked(logFood).mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    render(<FoodPicker />);

    await user.click(screen.getByRole("button", { name: "Log dish" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not log the dish. Try again.",
    );
    expect(screen.getByRole("button", { name: "Log dish" })).toBeEnabled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
