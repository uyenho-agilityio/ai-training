import {
  addItem,
  applyCoupon,
  clearUsedCoupon,
  itemCount,
  reloadTotal,
  restoreItems,
  type Cart,
  type CartItem,
} from "./cart.ts";

const tea: CartItem = { name: "tea", price: 3 };
const bread: CartItem = { name: "bread", price: 2 };

/** Print one ticket's expected value next to the value the cart returns. */
const report = (ticket: string, expected: string, actual: string): void => {
  console.log(ticket);
  console.log(`  expected: ${expected}`);
  console.log(`  actual:   ${actual}`);
};

const saved: Cart = { items: [tea] };
report("1 reload total", "3", String(reloadTotal(saved)));

const counted: Cart = { items: [tea, bread] };
report("2 item count", "2", String(itemCount(counted)));

report(
  "3 restore items",
  "tea priced at 3",
  JSON.stringify(restoreItems(saved))
);

report("4 apply coupon", "9", String(applyCoupon(10, 10)));
report("4 clear used coupon", '""', JSON.stringify(clearUsedCoupon("SAVE10")));

const original: Cart = { items: [tea] };
const returned: Cart = addItem(original, bread);
report(
  "5 add item",
  "started with tea only",
  `started with ${JSON.stringify(original.items)}; returned ${JSON.stringify(returned.items)}; same object ${original === returned}`
);

// run cmd with: node --test --experimental-strip-types day-2/app/repro.ts
