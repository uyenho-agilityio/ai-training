---
name: publish-tickets
description: Create one GitHub issue per Nutrition Coach ticket file that has no issue yet, and write the issue number back into each ticket.
disable-model-invocation: true
---

# publish-tickets

Usage: `/publish-tickets`. Run once in 00a, and again when a ticket is added.

## Steps

1. List the files in `docs/tickets/` (`0*-*.md`). Keep the ones with no `**Issue:** #n` line.
2. For each, prepare:
   - title: `<ticket>: <name>`, for example `01: Sign in with Google`
   - body: the ticket file's content
   - labels: `nutrition-coach` and `status: todo`
3. Show the full list to the user and ask once: create these issues? Do nothing until they say yes.
4. On yes, create each issue with GitHub MCP (`issue_write`). Check each result.
5. Write the issue number back into its ticket as `**Issue:** #n`, on its own line under the title. Commit that change in a `docs/` branch and PR it, like any other change. Do not push to `feat/nutrition-coach`.
6. Report the list: ticket, issue number, URL.

## Rules

- Never create an issue twice. Skip any ticket that already has `**Issue:**`.
- If an issue cannot be created, stop and report which ones were created.
