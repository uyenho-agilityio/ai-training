# Discount code does not change the total, and a used code remains

## QA

Entering a discount code does not lower the total. A code that was already used still remains.

## Dev

What it asks: A discount code should lower the total, and a used code should be cleared.

What is ambiguous: The report describes two outcomes. It does not say the code, the percent, the total before and after, or what "remains" means.

First step: The report names no code or percent. Ask for one code, one percent, and the totals before and after, then reproduce that example.

Questions for the reporter:

1. After the code was used, where does it still appear?
2. Do the unchanged total and the remaining code happen in one try, or in two separate tries?
3. Did the total stay the same right after you entered the code, or only after you opened the cart again?
4. Was that code used earlier in this same cart, or in a previous cart?

## Reproduce-ready report

Fill this in after running the cart.

Steps:

Expected:

Actual:

Environment:
