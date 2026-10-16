# Day 03 review

Diff reviewed: `a871a28` on `feat/claude-training-fix`.
Order: correctness, tests, readability, security, scope.

## Correctness

`reloadTotal` sums each item price. The only test uses one item priced at 3, so a function that returns `3` or the first price would still pass.

Change: add a test with tea priced at 3 and bread priced at 2. The total must be 5.

## Tests

An empty saved cart is not covered. The sum of no items should be 0.

Change: add a test that an empty cart reloads to 0.

## Readability

The run command in `day-2/app/reload-total.test.ts`.

## Security

The function only adds numbers the caller already passed in. No security change in this diff.

## Scope

The fix stays inside `reloadTotal`. `itemCount`, `restoreItems`, `applyCoupon`, `clearUsedCoupon`, and `addItem` are still the Day 02 bugs. Do not fix them here.
