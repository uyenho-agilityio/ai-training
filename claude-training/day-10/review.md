# /code-review

Branch: `feat/day-9-hook`. Session on 23 Oct 2026. Claude reported four findings. Line numbers below are the lines in the current files. Claude cited `.claude/hooks/block-forbidden-command.js:76` and `.claude/hooks/format-on-edit.js:99`. Those lines are not in the files.

## 1. fix

File: `.claude/hooks/block-forbidden-command.js:10`

`JSON.parse(input)` has no guard. Empty or malformed stdin throws, Node exits 1, and Claude Code treats that as a non-blocking error. The hook then fails open, so `rm -rf` or `git push --force` can still run.

## 2. out of scope

File: `day-2/app/cart.ts:11`

`reloadTotal` sums `item.price`. It does not return 0. Day 2 and Day 3 notes still describe the old bug. This branch does not change the cart.

## 3. false positive

File: `day-2/app/cart.ts:21`

`itemCount` returns `cart.items.length`. Ticket 02 says the old bug returned 1. That ticket is the bug report, not a claim that the fixed function still returns 1.

## 4. fix

File: `.claude/hooks/format-on-edit.js:11`

`path.join` runs with `CLAUDE_PROJECT_DIR` before the script checks that Prettier exists. If that variable is unset, the hook throws instead of exiting as a no-op.
