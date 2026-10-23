# Retro

`/code-review` on `feat/day-9-hook` reported four findings. Two hook bugs were fixed. These two were not.

- Out of scope: `reloadTotal` already sums `item.price`. Day 2 and Day 3 notes still describe the old "returns 0" bug. This branch does not change the cart, so those notes stayed.
- False positive: Ticket 02 says `itemCount` returned 1. That sentence is the old bug report. The function now returns `cart.items.length`.
