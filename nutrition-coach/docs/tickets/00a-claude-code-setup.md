# 00a: Claude Code setup

**Issue:** #7

**Spec:** `docs/spec/spec.md` · **Plan:** `docs/plan/plan.md` step 1, details in `docs/plan/claude-setup.md` · **User story:** none (setup)

**What to build:** The Claude Code setup for this project, before any feature work: instructions, guardrail hooks, skills for the build and release stages, read-only review agents, and the GitHub workflows. Guardrails are hooks.

**Blocked by:** None (can start immediately)

**Status:** todo

- [ ] `CLAUDE.md` in `nutrition-coach/` covers project, commands, stack, architecture, things to know, hooks, skills and agents, MCP servers, conventions, git, parallel sessions, do not guess, and UI
- [ ] `.mcp.json` has `playwright` and `github`; the GitHub token is read from `GITHUB_PERSONAL_ACCESS_TOKEN` and is not in the file
- [ ] Hooks in `.claude/settings.json`: `block-forbidden-command.sh`, `block-destructive-db.sh`, `protect-secrets.sh`, `protect-migrations.sh`, `protect-approved-docs.sh`, `require-test-first.sh`, `approve-merge.sh`, `check-commit-message.sh`, `check-branch-base.sh`, `format-on-edit.sh`
- [ ] `require-test-first.sh` blocks a new source file until its test file exists (`__tests__/<file>.test.ts`, or `index.test.tsx` for a component)
- [ ] `.claude/hooks/test-hooks.sh` runs every case in "Proof for 00a" in `docs/plan/claude-setup.md` and all of them give the expected result
- [ ] Skills `do-task`, `do-tdd`, `check-release` and `publish-tickets` exist in `.claude/skills/`; all but `do-tdd` can only be run by the user
- [ ] `do-task` runs a ticket from start to merge and stops only at the three gates: ticket plan, before push, before merge
- [ ] GitHub work (issues, labels, PRs, merge) goes through GitHub MCP; `loop.md` has the "PR check" section
- [ ] `/publish-tickets` has created one issue per ticket and written each issue number into its ticket
- [ ] `do-task` agrees the test seams before any test and builds through `do-tdd`: one failing test at an agreed seam, the least code to pass it, then the next test; unit tests go in `__tests__/<file>.test.ts`, or `<Name>/index.test.tsx` for components
- [ ] Agents `spec-checker` and `rls-auditor` exist in `.claude/agents/` with read-only tools
- [ ] `/.github/workflows/nutrition-coach-ci.yml` and `/.github/workflows/nutrition-coach-code-review.yml` run on PRs into `feat/nutrition-coach` only
- [ ] `/.github/workflows/claude.yml` uses `CLAUDE_CODE_OAUTH_TOKEN` instead of `ANTHROPIC_API_KEY`; a `@claude` comment on a PR gets an answer
- [ ] Started in `nutrition-coach/`, `/mcp` lists both servers and `/do-task`, `/check-release` are available
- [ ] `docs/spec/spec.md` and `docs/requirements/intake-questions.md` are updated with your OK: user story 10 (water target), no dish twice in a day, Tailwind CSS 4, design file names, Q07 and Q09
- [ ] Demo: try `supabase db reset` and `cat .env.local` and see both blocked; try to edit `docs/spec/spec.md` and get asked first
