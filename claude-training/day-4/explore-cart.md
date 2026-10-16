# Explore reloadTotal

Explanation: `reloadTotal` takes a Cart and adds up the price of every item in `cart.items` using `reduce`. The running sum starts at 0 and grows by `item.price` for each item. It returns that sum as is: no rounding, discounts, or quantity handling, and it never changes the cart. The comment calls it the total of a cart that was saved and opened again, but the code does not treat a reloaded cart differently from a fresh one.

## Claim 1

An empty cart totals 0.

Verified: true. `day-2/app/cart.ts` line 14. `reduce` starts at `0`, so an empty `cart.items` returns 0 and does not throw.

## Claim 2

The function reads only `item.price`.

Verified: true. Line 13 is `sum + item.price`. `item.name` is never used. Nothing in lines 11–17 assigns to `cart` or `cart.items`.
