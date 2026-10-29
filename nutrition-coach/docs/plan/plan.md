# Plan: Nutrition Coach MVP (from intent.md and spec.md)

Approved 2026-10-29. US n = user story n in `docs/spec/spec.md`; T0n = ticket `docs/tickets/0n-*.md`; R, D, A = `decisions.md`. Inputs: `docs/spec/spec.md`, `docs/tickets/`, `docs/design/`, `docs/requirements/`. Details: `claude-setup.md`, `code-structure.md`, `test-strategy.md`, `decisions.md`.

## Files that change

All new, under `nutrition-coach/`: `CLAUDE.md`, `.mcp.json`, `loop.md`, `.claude/` (hooks, skills, agents), `package.json` and configs, `supabase/migrations/0001_init.sql`, `src/{app,components,constants,hooks,icons,schemas,stores,theme,types,utils}`, `e2e/`. At the repo root: `.github/workflows/nutrition-coach-ci.yml`, `nutrition-coach-code-review.yml`, and one line in `claude.yml`. Docs: `spec.md`, `intake-questions.md`, `team-decisions.md`, tickets.

## Order of work

Every ticket is one issue, one branch from `feat/nutrition-coach`, one PR, built test-first, at most two sessions at once.

1. Claude Code setup: hooks, skills, agents, workflows; update the spec with D1–D7 (00a).
2. Scaffold: Next.js 16, Tailwind 4 theme, Vitest, Playwright, schema with RLS (00b).
3. Sign in with Google; first sign-in goes to Profile (US 1, T01).
4. Sign out (US 2, T02), then light, dark and system theme (US 9, T09).
5. Profile and daily target (US 3, T03).
6. Log a built-in dish and see what is left, in Vietnam time (US 4, T04).
7. Delete an entry (US 5, T05) and over-target warning (US 7, T07); custom food (US 6, T06).
8. Sample 7-day plan, no dish twice a day (US 8, T08), then water target (US 10, T10).
9. Full end-to-end run and README (US 1–10).

## Risks

The ±10% plan rule cannot be met above ≈ 2,131 kcal; the plan keeps the closest day and shows the gap (US 8, R2). Supabase and Google OAuth come from the product team, so T01 waits on them (R7, A1). Users must never see each other's data (US 4–6, R8). Server time is UTC, so "today" must be computed in Asia/Ho_Chi_Minh (US 4, R4).

## Proof

Vitest covers targets, totals, dates, plan, water, schemas, stores and every component (US 3–10); Playwright runs the whole flow from sign-in to sign-out (US 1–10); an SQL check shows one user cannot read or delete another's rows (US 5); hook tests pass for 00a. Every ticket passes `lint`, `typecheck`, `test` and `build` before merge.
