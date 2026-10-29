---
name: check-release
description: Check that a Nutrition Coach ticket branch is ready to merge into feat/nutrition-coach. Reports only, never merges.
disable-model-invocation: true
---

# check-release

Usage: `/check-release [branch]` (default: the current branch). Run by `/do-task` before gate 3, or on its own.

This skill reports. It never merges, pushes or changes the PR.

## Checks

1. **Branch state**: the branch is based on `github/feat/nutrition-coach` (`git merge-base --is-ancestor`), and is in sync with it. Say what is behind.
2. **PR**: open PR into `feat/nutrition-coach` (GitHub MCP). List its review comments and mark which are resolved.
3. **Checks**: `npm ci`, then `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`. Report each result. Report the failing output if any fails.
4. **Vercel preview**: report **not checked** until the Vercel project exists (A4).
5. **Docs match code**:
   - env vars in `README.md`, `CLAUDE.md` and `.env.example` agree
   - new tables are in `docs/design/database_schema.md` and have a new migration
   - new visual rules are in `docs/design/ui_ux_branding.md`
   - the ticket `Status` and checkboxes are updated
6. **Leftovers in the diff**: `console.log`, `TODO`, secret-looking strings, and any `.env*.local` or `playwright/.auth/` file.
7. **Manual checks**: list what a person must still check (the ticket's demo line at 375 px and desktop, light and dark).

## Report

One short block per check: PASS, FAIL (with the reason) or NOT CHECKED (with the reason). End with a single line: ready to merge, or not ready, and why.
