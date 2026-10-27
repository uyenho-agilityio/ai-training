import {
  addItem,
  itemCount,
  reloadTotal,
  restoreItems,
} from "../day-2/app/cart.ts";
import { parseCartItemInput } from "./parse-item.ts";
import type { CartPageState, CartPageView, ParsedCartItem } from "./types.ts";

/** Start from an empty cart and no rejection message. */
export const createCartPageState = (): CartPageState => {
  return { cart: { items: [] }, notice: "" };
};

/**
 * Add a valid item through `addItem`.
 * A rejected name or price leaves the cart unchanged and keeps the reason.
 */
export const submitCartItem = (
  state: CartPageState,
  rawName: string,
  rawPrice: string,
): CartPageState => {
  const parsed: ParsedCartItem = parseCartItemInput(rawName, rawPrice);
  if (!parsed.ok) {
    return { cart: state.cart, notice: parsed.reason };
  }

  return {
    cart: addItem(state.cart, { name: parsed.name, price: parsed.price }),
    notice: "",
  };
};

/** Read the count, total, and items through the cart functions. */
export const toCartPageView = (
  state: CartPageState,
  nameValue: string,
  priceValue: string,
): CartPageView => {
  return {
    nameValue,
    priceValue,
    notice: state.notice,
    count: itemCount(state.cart),
    total: reloadTotal(state.cart),
    items: restoreItems(state.cart),
  };
};
