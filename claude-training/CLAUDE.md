# CLAUDE.md

## Commands

Run from this directory (claude-training):

```bash
node --test --experimental-strip-types day-2/app/reload-total.test.ts
node --test --experimental-strip-types day-2/app/item-count.test.ts
node --test --experimental-strip-types day-2/app/restore-items.test.ts
```

## Conventions

- Committed files are English.
- A change fixes only the ticket it names. Do not fix unrelated code you notice; mention it instead.

## Never do

- Do not add dependencies, except `typescript` as a local `devDependency` for the Day 7 TypeScript LSP exercise.
- Do not change `applyCoupon`, `clearUsedCoupon`, or `addItem` unless the ticket says so.
