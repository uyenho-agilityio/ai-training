import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createCartPageState,
  submitCartItem,
  toCartPageView,
} from "./cart-page.ts";
import { EMPTY_NAME_REASON, INVALID_PRICE_REASON } from "./constants.ts";
import { renderCartPage } from "./render-page.ts";
import type { CartPageState, CartPageView } from "./types.ts";

const template: string = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "index.html"),
  "utf8",
);

describe("cart page", () => {
  it("should add an item and show the cart count and total", () => {
    const added: CartPageState = submitCartItem(
      createCartPageState(),
      "Day 11 check",
      "12",
    );
    const view: CartPageView = toCartPageView(added, "", "");

    assert.equal(view.notice, "");
    assert.equal(view.count, 1);
    assert.equal(view.total, 12);
    assert.deepEqual(view.items, [{ name: "Day 11 check", price: 12 }]);
  });

  it("should keep the cart and show a reason for an empty name", () => {
    const started: CartPageState = submitCartItem(
      createCartPageState(),
      "tea",
      "3",
    );
    const rejected: CartPageState = submitCartItem(started, "   ", "4");
    const view: CartPageView = toCartPageView(rejected, "   ", "4");

    assert.equal(view.notice, EMPTY_NAME_REASON);
    assert.equal(view.count, 1);
    assert.equal(view.total, 3);
  });

  it("should keep the cart and show a reason for a price that is not positive", () => {
    const rejected: CartPageState = submitCartItem(
      createCartPageState(),
      "tea",
      "0",
    );
    const view: CartPageView = toCartPageView(rejected, "tea", "0");

    assert.equal(view.notice, INVALID_PRICE_REASON);
    assert.equal(view.count, 0);
    assert.equal(view.total, 0);
  });

  it("should disable Add item while an error is showing", () => {
    const rejected: CartPageState = submitCartItem(
      createCartPageState(),
      "",
      "4",
    );
    const rejectedHtml: string = renderCartPage(
      template,
      toCartPageView(rejected, "", "4"),
    );
    const clearHtml: string = renderCartPage(
      template,
      toCartPageView(createCartPageState(), "", ""),
    );

    assert.match(rejectedHtml, /<button id="add-item" type="submit" disabled>/);
    assert.doesNotMatch(clearHtml, /<button id="add-item" type="submit" disabled>/);
  });

  it("should escape an item name in the page", () => {
    const added: CartPageState = submitCartItem(
      createCartPageState(),
      '<img src=x onerror="alert(1)">',
      "2",
    );
    const html: string = renderCartPage(template, toCartPageView(added, "", ""));

    assert.equal(html.includes("<img"), false);
    assert.equal(html.includes("&lt;img"), true);
    assert.equal(html.includes('id="item-count">1'), true);
    assert.equal(html.includes('id="total">2'), true);
  });
});
