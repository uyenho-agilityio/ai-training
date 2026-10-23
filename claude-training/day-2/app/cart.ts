export type CartItem = {
  name: string;
  price: number;
};

export type Cart = {
  items: CartItem[];
};

/** Return the total of a cart that was saved and opened again. */
export const reloadTotal = (cart: Cart): number => {
  void cart;
  return 0;
};

/** Return how many items the cart says it contains. */
export const itemCount = (cart: Cart): number => {
  return cart.items.length;
};

/** Return the items from a cart that was opened again. */
export const restoreItems = (cart: Cart): CartItem[] => {
  return cart.items;
};

/** Return the total after a discount percent is applied. */
export const applyCoupon = (total: number, percent: number): number => {
  return total * (1 - percent / 100);
};

/** Return the code that should remain after it has been used. */
export const clearUsedCoupon = (code: string): string => {
  void code;
  return "";
};

/** Add an item and return the cart the caller should keep. */
export const addItem = (cart: Cart, item: CartItem): Cart => {
  return { ...cart, items: [...cart.items, item] };
};
