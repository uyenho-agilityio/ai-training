# Day 11

Developer checkpoint 3, then a cart page and a browser check. This repo has no iOS app and no game engine, so those loops do not apply.

## Checkpoint

| Requirement | Status |
| --- | --- |
| One skill merged | Done. Day 7 skills are on `feat/claude-training`. |
| One hook merged | Done. Pull request #2, `feat/day-9-hook`, merged. |
| One MCP tool used end to end | Done. GitHub MCP commented `Day 8 MCP check` on pull request #1. |
| One review acted on | Done. The two hook findings in `day-10/review.md` were fixed. |
| Role-day exercise | Phase 2 below. |

Work on `feat/day-11`, cut from `feat/claude-training`. Leave `feat/day-10-seeded-bug` alone.

## Phase 1

One page in this folder. It calls `addItem`, `itemCount`, `reloadTotal`, and `restoreItems`, and it does not change them. No new dependency. The cart stays in memory and resets when the server stops.

The form takes an item name and a price. After a valid add, the page shows the item count and the reloaded total. An empty name or a price that is not a positive number is rejected, with a short reason on the page. Add item uses a pointer cursor on hover. While that reason is showing, Add item is disabled, and editing the name or the price enables it again.

```bash
cd /Users/uyenho/Desktop/TRAINING/ai-training/claude-training
node --test --experimental-strip-types day-11/cart-page.test.ts
node --experimental-strip-types day-11/server.ts
```

Open `http://127.0.0.1:4311`.

## Phase 2

Run the page, then in a Claude Code session at the repo root:

```text
/chrome
```

Accept "Claude wants to use your browser" if it appears. Then send:

```text
Open the cart page at the local URL.
Read the browser console and tell me any errors.
Add one item named "Day 11 check" with price 12 through the form.
Read the item count and the total on the page.
Try an empty name and say what the page shows.
Take a screenshot after the valid item appears.
```

Write the URL, the console result, the count, the total, and the empty-name message in `day-11/web.md`.

Playwright MCP from Day 8 covers the same checks if `/chrome` does not connect. Phase 2 ends there. No second feature, and no planted bug.

### Playwright steps

Use the Playwright MCP tools only. Start the server first, then run each step and take a screenshot where the step says so.

1. Start the server with the Phase 1 command, then open `http://127.0.0.1:4311`.
2. Read the browser console. Record any errors. Expect none.
3. Read the page: item count and total. Expect `Items: 0` and `Total: 0` after a fresh start.
4. Fill Item name with `Day 11 check` and Price with `12`, then click Add item.
5. Read the page. Expect `Items: 1` and `Total: 12`. Take a screenshot.
6. Clear Item name, keep Price at `12`, and submit with Enter in the Price field. Add item is disabled only while an error from the last submit is showing. A fresh page with an empty name leaves it enabled. Editing the name or the price enables it again.
7. Read the page. Expect the alert `Enter an item name.`, with Items still `1` and Total still `12`, and Add item disabled. Take a screenshot.
8. Write the URL, the console result, the count, the total, and the empty-name message in `day-11/playwright.md`. Leave `day-11/web.md` for the `/chrome` run.
9. Close the browser.

Note: the cart stays in memory. If it still holds items from an earlier run, restart the server before step 3 so the counts start at zero.
