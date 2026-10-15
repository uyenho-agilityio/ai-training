import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { reloadTotal } from "./cart.ts";

describe("reloadTotal", () => {
  it("should reload a saved cart of tea priced at 3 to a total of 3", () => {
    const total: number = reloadTotal({
      items: [{ name: "tea", price: 3 }],
    });

    assert.equal(total, 3);
  });

  it("should reload tea priced at 3 and bread priced at 2 to a total of 5", () => {
    const total: number = reloadTotal({
      items: [
        { name: "tea", price: 3 },
        { name: "bread", price: 2 },
      ],
    });

    assert.equal(total, 5);
  });

  it("should reload an empty cart to a total of 0", () => {
    const total: number = reloadTotal({ items: [] });

    assert.equal(total, 0);
  });
});

// run cmd with: node --test --experimental-strip-types claude-training/day-2/app/reload-total.test.ts
