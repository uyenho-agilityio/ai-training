# Day 02

Ticket analysis and a buggy cart you can run. The assigned bug stays broken at the end of this day.

Files to add:

- `app/cart.ts` — cart functions. `reloadTotal` returns `0` even when saved items exist.
- `app/reload-total.test.ts` — one failing test: a saved cart `[{ name: "tea", price: 3 }]` reloads to a total of `3`.
- `tickets/01-reload-total.md` through `tickets/05-add-item.md` — for each ticket: what it asks, what is ambiguous, first step, reporter questions, and a reproduce-ready report (steps, expected, actual, environment).
- `git-conflict.md` — how conflict #1 was resolved. The assigned bug is still present after that merge.

Run the failing test from the repo root:

```bash
node --test --experimental-strip-types claude-training/day-2/app/reload-total.test.ts
```
