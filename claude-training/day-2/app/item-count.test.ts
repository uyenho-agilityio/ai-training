import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { itemCount } from "./cart.ts";

describe("itemCount", () => {
  /** The count equals the number of items that were added. */
  it("counts tea and bread as 2", () => {
    const count: number = itemCount({
      items: [
        { name: "tea", price: 3 },
        { name: "bread", price: 2 },
      ],
    });

    assert.equal(count, 2);
  });
});
