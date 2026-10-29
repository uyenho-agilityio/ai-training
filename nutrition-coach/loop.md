# Loop

Run by `/do-task` after a PR opens: `/loop 10m check the PR, following loop.md`. Stops when the PR is merged or closed.

## PR check

Each run:

1. Read the PR's state with GitHub MCP (`pull_request_read`): CI check status, and new review comments since the last run.
2. If CI failed, read the failing job log. Fix only failures that are inside the ticket's scope (its files and its acceptance criteria). Run `npm run lint && npm run typecheck && npm run test && npm run build` locally, then commit and push.
3. For each new review comment, fix it if it is inside the ticket. If it is outside the ticket, do not change code: list it under "Follow-up" in the PR and ask the user.
4. If nothing changed since the last run, report one line and stop for this run.
5. Stop the loop when the PR is merged or closed. Stop after the same failure in 3 runs in a row and report it.

A push that only fixes CI or review findings inside the ticket does not stop the flow again. Merging always asks the user first (`approve-merge.sh`).
