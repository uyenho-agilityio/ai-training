# Pull request

Base branch: `feat/claude-training`
Head branch: `feat/claude-training-fix`

## What

`reloadTotal` adds the price of each saved cart item and returns that sum. It no longer returns 0.

## Why

A saved cart with tea priced at 3 reloaded to a total of 0. The items were still in the cart. The total has to match those prices when the cart is opened again.

## How tested

- [x] On the commit, `node --test --experimental-strip-types day-2/app/reload-total.test.ts` failed: actual 0, expected 3.
- [x] On `feat/claude-training-fix`, the same command passed.
- [x] `node --experimental-strip-types day-2/app/repro.ts` shows ticket 1 as expected 3, actual 3. Tickets 2 through 5 are still wrong.

## Screenshots

There is no UI. The passing test printed:

```text
✔ should reload a saved cart of tea priced at 3 to a total of 3
ℹ pass 1
ℹ fail 0
```
