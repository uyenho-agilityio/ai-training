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
});

// run cmd with: node --test --experimental-strip-types day-2/app/reload-total.test.ts
