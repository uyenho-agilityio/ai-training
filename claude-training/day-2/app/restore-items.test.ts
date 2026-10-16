import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { restoreItems } from "./cart.ts";

describe("restoreItems", () => {
  it("should return tea priced at 3 for a cart holding only tea", () => {
    const items = restoreItems({ items: [{ name: "tea", price: 3 }] });

    assert.deepEqual(items, [{ name: "tea", price: 3 }]);
  });

  it("should return tea and bread in order", () => {
    const items = restoreItems({
      items: [
        { name: "tea", price: 3 },
        { name: "bread", price: 2 },
      ],
    });

    assert.deepEqual(items, [
      { name: "tea", price: 3 },
      { name: "bread", price: 2 },
    ]);
  });

  it("should return an empty list for an empty cart", () => {
    assert.deepEqual(restoreItems({ items: [] }), []);
  });
});
