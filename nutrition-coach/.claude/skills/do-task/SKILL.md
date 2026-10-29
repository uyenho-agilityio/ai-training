---
name: do-task
description: Take one Nutrition Coach ticket from start to merge. Stops only at three gates: ticket plan, before push, before merge.
disable-model-invocation: true
---

# do-task

Usage: `/do-task [--auto] <docs/tickets/<ticket>-*.md or issue link>`

Run from `nutrition-coach/`. Follow `CLAUDE.md` and the ticket's "Ticket lifecycle" in `docs/plan/claude-setup.md`.

`--auto` skips gate 1 only, and only for setup tickets (00a, 00b). Gates 2 and 3 always stop.

## 1. Start (no gate)

1. Read the ticket file: spec, user story, "Blocked by", acceptance checklist, demo line. If "Blocked by" names a ticket that is not merged, stop and say so.
2. Find the issue number (`**Issue:** #n` in the ticket). If there is none, stop and ask the user to run `/publish-tickets` first.
3. Set the issue label `status: in progress` (GitHub MCP). Remove `status: todo`.
4. Create the worktree and branch from `github/feat/nutrition-coach`: branch `feat/nc-<ticket>-<short>` for tickets, `chore/` or `docs/` for setup and docs. Run `git fetch github` first. The `check-branch-base` hook blocks any other base.

## 2. Gate 1: ticket plan (plan mode)

1. Analyse: read the spec sections, the design files, and the ticket. Confirm library APIs with the Explore agent (`node_modules/` docs), not from memory.
2. Write the plan: the files to create or change, and the **test seams** from `docs/plan/test-strategy.md` ("TDD seams" table). Each seam is one unit test file or one Playwright step.
3. Stop and wait for the user to approve the plan and the seams. Do not write files before that.

## 3. Build (no gate)

Build with `/do-tdd` for each seam, in order. Test commit and code commit go together per slice.

## 4. Review (no gate)

Run in parallel:

- `/code-review`
- `/security-review`
- `spec-checker` agent on the ticket
- `rls-auditor` agent, for 00b, T01, T03, T04, T05, T06

Fix the real findings. Do not fix findings outside the ticket: list them as follow-ups.

## 5. Checks (no gate)

`pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Add `pnpm e2e` when the UI changes. Fix loop: at most 3 rounds, then stop and report.

## 6. Gate 2: before push

Show the user:

- the diff summary (files, lines)
- the commit message (one line, `<type>: <summary>`, no body, no trailers)
- the PR body (below)

Wait for approval or edits. Do not commit or push before that.

PR body sections: **Ticket** (number, issue, US n), **Problem**, **Changes**, **Testing**, **Review findings acted on**, **Not tested**, **Follow-up**. End with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## 7. Push and PR (after approval)

1. Set the ticket file `Status: done` and tick its checkboxes in the same commit, so the file reads done exactly when the PR merges.
2. Commit, push to `github` (never to `feat/nutrition-coach` or `main`).
3. Open the PR with GitHub MCP: base `feat/nutrition-coach`, body from step 6, `Closes #<issue>`.
4. Label the issue `status: in review`.
5. Start `/loop 10m check the PR, following loop.md`.
6. After the PR opens, check its state with `ccd_pr` tools and report it.

Fixes for CI or review findings inside the ticket are pushed without a new gate. Anything outside the ticket asks the user first.

## 8. Gate 3: before merge

1. Run `/check-release <branch>` and show its report.
2. Ask the user to confirm the merge. The `approve-merge.sh` hook asks again before the merge call.
3. Merge with GitHub MCP.

## 9. After merge

- The issue closes through `Closes #n`. Confirm it is closed.
- Delete the branch, remove the worktree, sync the base branch in the main checkout.
- Stop the `/loop` (its own stop rule covers it).
- Report: PR link, merge commit, what was not tested.
