import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Text } from "@/components/Text";

describe("Text", () => {
  it("shows its content as a paragraph by default", () => {
    render(<Text>jane@example.com</Text>);

    expect(screen.getByText("jane@example.com").tagName).toBe("P");
  });

  it("shows its content as a span when asked", () => {
    render(<Text as="span">Nutrition Coach</Text>);

    expect(screen.getByText("Nutrition Coach").tagName).toBe("SPAN");
  });
});
