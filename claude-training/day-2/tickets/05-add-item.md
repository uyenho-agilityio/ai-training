# Adding an item also changes the cart I started with

## QA

Adding an item also changes the cart I started with, not only the new cart.

## Dev

What it asks: Adding an item should leave the cart I started with unchanged.

What is ambiguous: The report does not say which item was added, how the original cart changed, or what "the new cart" is.

First step: The report names no item. Ask what was in the cart, what was added, and what changed, then reproduce that example.

Questions for the reporter:

1. How did you get the new cart: a copy of the cart you started with, or a second look at that same cart?
2. Did the cart you started with change immediately, or only after you opened it again?

## Reproduce-ready report

Steps:

1. Start with a cart whose only item is tea priced at 3.
2. Call `addItem` in `cart.ts` to add bread priced at 2.
3. Read the cart you started with and the cart the function returned.

Expected: The cart you started with still contains only tea. The returned cart contains tea and bread.

Actual: Both carts contain tea and bread. They are the same object.

Environment: macOS, Chrome browser
