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

`/security-review` is a built-in command. It is not a plugin. Run it before the commit:

```text
/security-review
```

Nothing met the reporting bar. The notes are in `day-10/security.md`.

`security-guidance` and Claude Security scan are two plugins.

- `security-guidance` has no slash command. After `/plugin install security-guidance@claude-plugins-official`, it warns on edits, at the end of a turn, and on commit.
- Claude Security scan is `claude-security`. Install it, then `/reload-plugins`. The command is `/claude-security`. The first session had no Workflow tool, so no scan ran. After Dynamic workflows was enabled, a new session ran the scan.

Do not accept the suggested base `origin/HEAD`. That is GitLab `main` and covers about 56 commits back to Day 1. The prompt that scanned the hook work:

```text
/claude-security:claude-security scan this branch's changes since github/feat/claude-training at medium effort, and I understand it may take a while and use a lot of tokens.
```

The scan covered 4 commits and reported one low finding: `format-on-edit.js` can run a `node_modules/.bin/prettier` binary the agent could overwrite. This checkout has no Prettier binary, so the hook does not run. One panel voter called it a false positive. Details are in `day-10/security.md`.

## 4. Exercise

The two `fix` rows were fixed on `feat/day-9-hook`. `block-forbidden-command.js` now exits 2 when `JSON.parse` fails. `format-on-edit.js` exits 0 when `CLAUDE_PROJECT_DIR` is unset. `day-2/app/cart.ts` was not changed.

`day-10/retro.md` records the two review items that were not fixed: the `reloadTotal` note is out of scope, and the `itemCount` ticket line is a false positive.

The low scan finding was not fixed. The hook still only runs when a local Prettier binary exists, and this project does not have one.

`/loop`, `ultrathink`, and `/effort` are already practiced in `day-6/README.md`. The review order from Day 3 is correctness, tests, readability, security, then scope.
