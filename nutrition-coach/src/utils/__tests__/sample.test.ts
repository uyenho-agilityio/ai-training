import { describe, expect, it } from "vitest";

describe("unit test setup", () => {
  it("runs in jsdom with the jest-dom matchers", () => {
    const paragraph = document.createElement("p");
    paragraph.textContent = "Nutrition Coach";
    document.body.append(paragraph);

    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent("Nutrition Coach");
  });
});
