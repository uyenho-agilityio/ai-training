import type { Cart, CartItem } from "../day-2/app/cart.ts";

/** A form submission that is safe to add, or the reason it was rejected. */
export type ParsedCartItem =
  | { ok: true; name: string; price: number }
  | { ok: false; reason: string };

/** Cart plus the latest rejection, kept in memory for this server process. */
export type CartPageState = {
  cart: Cart;
  notice: string;
};

/** Values the HTML page needs after a load or a form post. */
export type CartPageView = {
  nameValue: string;
  priceValue: string;
  notice: string;
  count: number;
  total: number;
  items: readonly CartItem[];
};
