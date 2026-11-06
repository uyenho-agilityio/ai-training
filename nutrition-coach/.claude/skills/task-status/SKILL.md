---
name: task-status
description: Report where a Nutrition Coach ticket stands (last logged step, next step, what is missing). Read only, never changes files, pushes or merges.
disable-model-invocation: true
---

# task-status

Usage: `/task-status <docs/tickets/<ticket>-*.md or ticket number>`

Run from `nutrition-coach/`. This skill only reads. It never edits, commits, pushes, labels or merges.

## Steps

1. Find the ticket file. If the argument is a number, match `docs/tickets/<number>-*.md`.
2. Read its `Status:` line, its checkboxes, and its `## Log` section. If there is no `## Log`, say the ticket has not started under `/do-task`.
3. Take the last log line. Its `<step>` says where `/do-task` stopped. The next step is the one after it, in this order: `start`, `gate1`, `slice <n>`, `review`, `checks`, `gate2`, `pr`, `gate3`, `merged`.
4. Check the branch: `git branch --list 'feat/nc-<ticket>-*' 'chore/nc-<ticket>-*' 'docs/nc-<ticket>-*'` and, if a worktree exists, `git -C <worktree> status --short`. Say whether it has uncommitted changes.
5. If the last step is `pr` or later, check the PR state with GitHub MCP (open, merged or closed) and its checks. Do not check it for earlier steps.

## Report

Short block, in this order:

- **Ticket:** file name and `Status:`
- **Last logged step:** the line, word for word
- **Next step:** what `/do-task` would do next, and whether it needs a gate
- **Branch and worktree:** present or missing, uncommitted changes yes or no
- **Problems:** a missing or out-of-order log line, a missing branch, a PR that does not match the log. Say what is wrong. Do not fix it.

If the log and the git state disagree, report both and ask the user to decide. Do not guess which one is right.
