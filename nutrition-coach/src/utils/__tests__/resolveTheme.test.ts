import { describe, expect, it } from "vitest";

import { resolveTheme } from "@/utils/resolveTheme";

describe("resolveTheme", () => {
  it("returns the chosen theme, whatever the device setting is", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the device setting until the user picks a theme", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
});
