# Day 10

`/code-review` runs inside a Claude Code session. `@claude review` is a GitHub pull request comment that starts the GitHub Action. Typing one does not run the other.

The real branch is `feat/day-9-hook`. Start the session from this folder:

```bash
claude
```

## 1. /code-review

```text
/code-review
```

The review returns four findings. They are recorded in `day-10/review.md`.

| File                                          | Verdict                                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `.claude/hooks/block-forbidden-command.js:10` | fix. `JSON.parse` has no guard, so the hook can fail open                          |
| `day-2/app/cart.ts:11`                        | out of scope. `reloadTotal` is already fixed. This branch does not change the cart |
| `day-2/app/cart.ts:21`                        | false positive. Ticket 02 describes the old `itemCount` bug                        |
| `.claude/hooks/format-on-edit.js:11`          | fix. `path.join` throws when `CLAUDE_PROJECT_DIR` is unset                         |

Claude cited lines 76 and 99. Those lines are not in the hook files. The lines in the table are the current ones.

## 2. Ultrareview

Wait for the seeded-buggy branch from the lead. Check it out, open a new session, and send:

```text
/code-review ultra
```

This needs a claude.ai account. Write the findings in `day-10/ultrareview.md`. Compare them with `day-10/review.md`: which planted bug only ultra caught, and which extra comments are false positives.

## 3. Security

`/security-review` is a built-in command. It is not a plugin. Before committing the fixes:

```text
/security-review
```

`security-guidance` and Security scan are plugins. Type `/plugin`, open Discover, and install the name the team uses. Write the plugin name and one thing it checks in `day-10/security.md`.

## 4. Exercise

Fix the two `fix` rows in `day-10/review.md`. Leave the false positive and the out-of-scope cart notes unchanged. Run the three cart test commands from `CLAUDE.md` if the diff touches `day-2`.

Commit on `feat/day-9-hook` and push to the `github` remote. Pull request #2 should be green.

Write `day-10/retro.md` with one line for each false positive or out-of-scope finding: what the review said, and why it was not fixed.

`/loop`, `ultrathink`, and `/effort` are already practiced in `day-6/README.md`. The review order from Day 3 is correctness, tests, readability, security, then scope.
