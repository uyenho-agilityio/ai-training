# Item count is one short

## QA

The item count on the cart is one less than the number of items I added.

## Dev

What it asks: The count shown for the cart should equal the number of items that were added.

What is ambiguous: The report does not say how many items were added, whether the missing item is the first or the last, or whether the items are still listed while the count is wrong.

First step: The report has no counts to run. Ask how many items were added and what count was shown, then reproduce that example.

Questions for the reporter:

1. Are all of the added items still listed?
2. Is the count the number of lines, or the sum of quantities?
3. Does the count go wrong right after adding an item, or only after you open the cart again?
4. Does this happen every time, including when you add only one item?

## Reproduce-ready report

Fill this in after running the cart.

Steps:

Expected:

Actual:

Environment:
