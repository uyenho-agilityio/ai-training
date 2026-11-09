---
name: do-task
description: Take one Nutrition Coach ticket from start to merge. Stops only at three gates: ticket plan, before push, before merge.
disable-model-invocation: true
---

# do-task

Usage: `/do-task [--auto] <ticket file name or issue link>`

Run from `nutrition-coach/`. Follow `CLAUDE.md` and the ticket's "Ticket lifecycle" in `docs/plan/claude-setup.md`.

`--auto` skips gate 1 only, and only for setup tickets (00a, 00b). Gates 2 and 3 always stop.

## Log (every step)

Each step writes one line at the end of the ticket file, under a `## Log` heading (create the heading the first time). Format: `- <YYYY-MM-DD> <step>: <what finished>`, where `<step>` is one of `start`, `gate1`, `slice <n>`, `review`, `checks`, `gate2`, `pr`, `gate3`, `merged`. Example: `- 2026-11-07 slice 2: test and code committed, 4 tests pass`.

The line is written when the step finishes, not when it starts. Lines are never edited or removed. The log is how `/do-task` resumes and how `/task-status` reads progress.

## 1. Start (no gate)

0. Resume check: if the ticket has a `## Log`, read its last line and continue from the step after it (skip finished steps). If the last line is missing or unclear, or the branch named in the ticket's log is gone, stop and ask the user. A missing worktree is not a reason to stop: tickets may be built in the main checkout on their branch. Do not guess.
1. Read the ticket file: spec, user story, "Blocked by", acceptance checklist, demo line. If "Blocked by" names a ticket that is not merged, stop and say so.
2. Find the issue number (`**Issue:** #n` in the ticket). If there is none, stop and ask the user to run `/publish-tickets` first.
3. Set the issue label `status: in progress` (GitHub MCP). Remove `status: todo`.
4. Create the branch from `github/feat/nutrition-coach`: branch `feat/nc-<ticket>-<short>` for tickets, `chore/` or `docs/` for setup and docs. Run `git fetch github` first. Build in the main checkout on that branch by default; use a worktree only if the user asks for one. Log `start` with the branch name and "no worktree" or the worktree path. The `check-branch-base` hook blocks any other base.
5. Log `start`.

## 2. Gate 1: ticket plan (plan mode)

1. Analyse: read the spec sections, the design files, and the ticket. Confirm library APIs with the Explore agent (`node_modules/` docs), not from memory.
2. Write the plan: the files to create or change, and the **test seams** from `docs/plan/test-strategy.md` ("TDD seams" table). Each seam is one unit test file or one Playwright step.
3. Stop and wait for the user to approve the plan and the seams. Do not write files before that.
4. After approval, log `gate1`.

## 3. Build (no gate)

Build with `/do-tdd` for each seam, in order. Test commit and code commit go together per slice. Log `slice <n>` after each seam passes.

If the approved plan has no seams (nothing to build), write no `slice` line. Stop, say so, and ask the user whether to close the ticket or add seams. Do not run the review and checks on an empty diff.

## 4. Review (no gate)

Run in parallel:

- `/code-review`
- `/security-review`
- `spec-checker` agent on the ticket
- `rls-auditor` agent, for 00b, T01, T03, T04, T05, T06

Fix the real findings. Do not fix findings outside the ticket: list them as follow-ups. Log `review`.

## 5. Checks (no gate)

`pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Add `pnpm e2e` when the UI changes. Fix loop: at most 3 rounds, then stop and report. Log `checks` when all pass.

## 6. Gate 2: before push

Show the user:

- the diff summary (files, lines)
- the commit message (one line, `<type>: <summary>`, no body, no trailers)
- the PR body (below)

Wait for approval or edits. Do not commit or push before that. Log `gate2` after approval.

PR body sections: **Ticket** (number, issue, US n), **Problem**, **Changes**, **Testing**, **Review findings acted on**, **Not tested**, **Follow-up**. End with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## 7. Push and PR (after approval)

1. Set the ticket file `Status: done` and tick its checkboxes in the same commit, so the file reads done exactly when the PR merges.
2. Commit, push to `github` (never to `feat/nutrition-coach` or `main`).
3. Open the PR with GitHub MCP: base `feat/nutrition-coach`, body from step 6, `Closes #<issue>`.
4. Label the issue `status: in review`.
5. Start `/loop 10m check the PR, following loop.md`.
6. After the PR opens, check its state with `ccd_pr` tools and report it.
7. Log `pr` with the PR number. Commit this log line in the same commit as the ticket status, so the file in git matches the last step.

Fixes for CI or review findings inside the ticket are pushed without a new gate. Anything outside the ticket asks the user first.

## 8. Gate 3: before merge

1. Run `/check-release <branch>` and show its report.
2. Ask the user to confirm the merge. The `approve-merge.sh` hook asks again before the merge call.
3. Merge with GitHub MCP. Log `gate3` after the user confirms.

## 9. After merge

- The issue closes through `Closes #n`. Confirm it is closed.
- Delete the branch, remove the worktree if one was made, sync the base branch in the main checkout.
- Stop the `/loop` (its own stop rule covers it).
- Report: PR link, merge commit, what was not tested.
- Log `merged` after the merge succeeds. The log line goes on `feat/nutrition-coach` only with the ticket's next commit, so say in the report if it is still pending.
