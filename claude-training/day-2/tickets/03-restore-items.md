# Item list is empty after opening the cart again

## QA

When I open the cart again, the item list is empty even though items were there before.

## Dev

What it asks: Opening the cart again should show the items that were there before.

What is ambiguous: The report does not say whether the cart was saved, whether the total is also empty, or what "open again" means.

First step: The report does not name the items. Ask which items were in the cart before it was opened again, then reproduce that example.

Questions for the reporter:

1. Did you save the cart before opening it again?
2. Is the total empty as well, or only the item list?
3. Is "open again" a reload, reopening the cart, or another action?
4. What exact steps did you take from having items in the cart to seeing an empty list?
5. Does this happen every time, with one item and with many?

## Reproduce-ready report

Steps:

1. Save a cart whose only item is tea priced at 3.
2. Open that cart again by calling `restoreItems` in `cart.ts`.
3. Read the returned list.

Expected: The list contains tea priced at 3.

Actual: The list is empty.

Environment: macOS, Chrome browser
