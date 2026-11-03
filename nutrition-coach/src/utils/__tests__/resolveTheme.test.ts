import { describe, expect, it } from "vitest";

import { resolveTheme } from "@/utils/resolveTheme";

describe("resolveTheme", () => {
  it("returns light and dark as chosen, whatever the system setting is", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the system setting when the choice is system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});
