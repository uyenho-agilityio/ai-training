import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProfile } from "@/app/actions/profile";
import { ProfileForm } from "@/components/ProfileForm";

vi.mock("@/app/actions/profile", () => ({
  saveProfile: vi.fn(),
}));

// Values are worked out by hand in utils/__tests__/targets.test.ts
const savedTarget = { kcal: 2211, proteinG: 160, carbG: 254, fatG: 61 };

async function fillValidProfile(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "Male" }));
  await user.type(screen.getByLabelText("Age"), "30");
  await user.type(screen.getByLabelText("Height (cm)"), "175");
  await user.type(screen.getByLabelText("Weight (kg)"), "80");
  await user.selectOptions(screen.getByLabelText("Activity level"), "moderate");
}

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.mocked(saveProfile).mockReset();
  });

  it("shows an error and does not save when the age is out of range", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await fillValidProfile(user);
    await user.clear(screen.getByLabelText("Age"));
    await user.type(screen.getByLabelText("Age"), "9");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Age must be from 10 to 120",
    );
    expect(saveProfile).not.toHaveBeenCalled();
  });

  it("asks for age when it is left empty", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await fillValidProfile(user);
    await user.clear(screen.getByLabelText("Age"));
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Age is required",
    );
    expect(saveProfile).not.toHaveBeenCalled();
  });

  it("shows an error when body fat % is out of range", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await fillValidProfile(user);
    await user.type(screen.getByLabelText("Body fat % (optional)"), "65");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Body fat must be from 3 to 60%",
    );
    expect(saveProfile).not.toHaveBeenCalled();
  });

  it("shows the daily target after a successful save", async () => {
    const user = userEvent.setup();
    vi.mocked(saveProfile).mockResolvedValue({
      ok: true,
      target: savedTarget,
    });
    render(<ProfileForm />);

    await fillValidProfile(user);
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByText("2211 kcal")).toBeInTheDocument();
    expect(screen.getByText("160 g protein")).toBeInTheDocument();
    expect(screen.getByText("254 g carbs")).toBeInTheDocument();
    expect(screen.getByText("61 g fat")).toBeInTheDocument();
  });
});
