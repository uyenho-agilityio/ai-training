# Saved cart total shows 0

## QA

After I open a saved cart again, the total shows 0 even though the cart still has items.
Example: a cart with tea priced at 3 reloads to a total of 0.

## Dev

What it asks: Opening a saved cart again should still show a total that matches the items in it.

What is ambiguous: The report does not say whether the items are still listed when the total is 0, whether the total was correct before saving, or what "open again" means.

First step: Open a saved cart that contains tea priced at 3, and record the total. Then ask QA what that run did not answer.

Questions for the reporter:

1. Was the total 3 before the cart was saved?
2. When the total is 0, are the items still listed with the same prices and quantities?
3. Is "open again" a reload, closing and reopening, or opening the cart from a saved list?
4. Does this happen every time, and with more than one item?
5. Does the total become correct if you change a quantity after reopening?

## Reproduce-ready report

Steps:

1. Save a cart whose only item is tea priced at 3.
2. Open that saved cart again by calling `reloadTotal` in `cart.ts`.
3. Read the returned total.

Expected: The total is 3.

Actual: The total is 0.

Environment: macOS, Chrome browser
