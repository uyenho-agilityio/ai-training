---
name: release-checklist
description: Check a cart ticket branch before opening a merge request. Use when a ticket fix is ready to ship.
---

# Release checklist

Run the three test files from `claude-training`:

- `node --test --experimental-strip-types day-2/app/reload-total.test.ts`
- `node --test --experimental-strip-types day-2/app/item-count.test.ts`
- `node --test --experimental-strip-types day-2/app/restore-items.test.ts`

Confirm the diff touches only the ticket it names. Do not change `applyCoupon`, `clearUsedCoupon`, or `addItem` unless that ticket says so. The merge request target is `feat/claude-training`.
