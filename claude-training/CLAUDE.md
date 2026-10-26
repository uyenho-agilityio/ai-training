# CLAUDE.md

## Commands

Run from this directory (claude-training):

```bash
node --test --experimental-strip-types day-2/app/reload-total.test.ts
node --test --experimental-strip-types day-2/app/item-count.test.ts
node --test --experimental-strip-types day-2/app/restore-items.test.ts
node --test --experimental-strip-types day-11/cart-page.test.ts
node --experimental-strip-types day-11/server.ts
```

## Conventions

- Committed files are English.
- A change fixes only the ticket it names. Do not fix unrelated code you notice; mention it instead.

## Never do

- Do not add dependencies, except `typescript` as a local `devDependency` for the Day 7 TypeScript LSP exercise.
- Do not change `applyCoupon`, `clearUsedCoupon`, or `addItem` unless the ticket says so.
- Do not build the Day 11 page on `feat/day-10-seeded-bug`. That branch keeps `reloadTotal` returning `0` on purpose.

## Day 11

Branch: `feat/day-11`. One local page in `day-11/` calls `addItem`, `itemCount`, `reloadTotal`, and `restoreItems`. It does not change those functions, and it does not add a dependency. Node and one HTML file are enough. The cart stays in memory and resets when the server stops.

Phase 1 is that page: a form for item name and price, then the item count and the reloaded total.

Phase 2 is the browser check of that same page. Open it from a Claude session, read the console, add one item through the form, and save a screenshot. Record the URL, the console result, and the count and total in `day-11/web.md`. That finishes the role-day exercise.

Do not plant a bug for this check. Day 10 already did that. The page should show the numbers the cart functions return. Reject an empty name or a price that is not a positive number, and show why, so the form has a real edge to try.
