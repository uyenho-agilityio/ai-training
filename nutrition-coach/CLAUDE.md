# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Start Claude Code from this folder (`cd nutrition-coach && claude`). The hooks, skills and agents in `.claude/` only run from here.

## Project

Nutrition Coach is a fat-loss web app for one user at a time. It computes a daily calorie and macro target from a profile, logs built-in and custom dishes, shows what is left for the day, offers a 7-day sample plan, and shows a daily water target. Scope and user stories: `docs/spec/spec.md`. Intent: `docs/intent/intent.md`. Build plan and tickets: `docs/plan/plan.md` and `docs/tickets/`.

## Commands

The package manager is pnpm, pinned in `package.json` (`packageManager`). Install with `pnpm install`; never use npm or commit a `package-lock.json`. `pnpm-workspace.yaml` only holds pnpm settings: `unrs-resolver` is in `ignoredBuiltDependencies`, since its install script only downloads a fallback binary.

- `pnpm dev`: local server on port 3000
- `pnpm build`
- `pnpm lint`: ESLint (`eslint-config-next` core web vitals and TypeScript)
- `pnpm typecheck`: `tsc --noEmit`
- `pnpm test`: Vitest, one run (`vitest run`)
- `pnpm e2e`: Playwright. Starts `pnpm dev` itself, or reuses a server already on port 3000

One test:

- `pnpm vitest run src/utils/__tests__/<name>.test.ts`, or add `-t "<test name>"`
- `pnpm vitest` for watch mode
- `pnpm exec playwright test e2e/<file>.spec.ts`
- After a Playwright upgrade: `pnpm exec playwright install chromium`

Every ticket must pass `lint`, `typecheck`, `test` and `build` before merge.

### Test setup

- `vitest.config.mts`: `jsdom` for every test; picks up only `src/**/__tests__/*.test.{ts,tsx}` and `src/components/**/index.test.tsx`, so `e2e/` is never run by Vitest. `@/` resolves through `resolve.tsconfigPaths`.
- `vitest.setup.ts`: loads the jest-dom matchers and runs Testing Library `cleanup` after each test. Globals are off: import `describe`, `it`, `expect` from `vitest`.
- `playwright.config.ts`: the `setup` project runs `e2e/*.setup.ts` and saves the browser state to `playwright/.auth/user.json`; the `chromium` project depends on it and reuses that state. In 00b the setup only saves an empty state; T01 adds the manual Google sign-in.

## Stack

Spec "Architectural decisions" and `docs/design/architecture.md` are the source.

- Next.js 16.4.3, App Router, TypeScript, pnpm
- React
- Tailwind CSS 4.3 with `@tailwindcss/postcss`
- Supabase Auth (Google sign-in only) and Supabase PostgreSQL with Row Level Security
- `@supabase/ssr` for the session
- Zustand for UI state and the theme preference only
- Zod for validation on the server
- Vitest, Testing Library and jsdom for unit tests; Playwright for end-to-end
- Hosting: Vercel (frontend), Supabase (data)

## Architecture

Layout (from `docs/plan/code-structure.md`):

```
src/
├── app/          routes, layouts, Server Actions (app/actions/), OAuth callback
├── components/   one folder per component: <Name>/index.tsx + index.test.tsx
├── constants/    fixed data and rules: food catalog, activity factors, deficit, water amounts
├── hooks/        client hooks
├── icons/        SVG icon components
├── schemas/      Zod schemas
├── stores/       Zustand stores (theme only)
├── theme/        Tailwind theme: tokens, dark theme, fonts
├── types/        shared TypeScript types
├── utils/        pure functions (unit tested) and utils/supabase/ (server only)
└── proxy.ts      session refresh
```

- Reads: Server Components. Writes: Server Actions. No separate API routes, except the one OAuth callback route `src/app/auth/callback/route.ts` (decision D2).
- Pure logic lives in `src/utils/` and `src/constants/`, with unit tests.
- Queries live in `src/utils/supabase/queries/`. Every query filters by `user_id`.

## Styling

- Tailwind utility classes in `className`.
- Tokens (colors, font, radius, shadows, breakpoints) only in `src/theme/`. `globals.css` holds only the shared base.
- How it is wired: `postcss.config.mjs` runs `@tailwindcss/postcss`. `src/app/globals.css` imports `tailwindcss` and `src/theme/index.css`, whose `@theme` block defines the tokens, so they become utilities (`bg-background`, `text-primary`, `text-text`). `src/theme/fonts.ts` loads Be Vietnam Pro with `next/font` as `--font-be-vietnam-pro`; the root layout puts that variable on `<html>`, and `@theme` maps `--font-sans` to it.
- No `style` prop, no CSS modules.
- Dark mode follows the `data-theme` switch, not only the OS setting.

## Things to know

- All "today" dates use Asia/Ho_Chi_Minh, computed with `todayInVietnam(now)`. Server time is UTC.
- Meal entries copy calories and macros at logging time. Changing a food later does not change past entries.
- Targets are computed from the profile when shown. They are not saved per day.
- Every Server Action calls `requireUser()` first, except `signInWithGoogle`, which runs before a user exists. RLS is the second guard. Each policy checks `user_id = auth.uid()` with `using` and `with check`.
- Sign-in: `signInWithGoogle` (Server Action) starts OAuth. `/auth/callback` exchanges the code and sends everyone to `/today`. `/today` sends a user with no profile on to `/profile`. `src/proxy.ts` refreshes the session and redirects a signed-out visit to `/today` or `/profile` to `/login`. Pages still call `requireUser()`. Today and Profile live in the `(app)` route group, whose layout shows the header with `SignOutButton`. `signOut` (Server Action) signs out and goes to `/login`.
- Signed-in e2e tests use `playwright/.auth/user.json`. Run `E2E_SIGN_IN=manual pnpm e2e` once to sign in by hand with a test Google account. Delete that file to sign in again. `E2E_SIGN_OUT=1 pnpm e2e` runs the sign-out test, which ends the saved session. Delete the file after that.
- Never use the service role key in app code. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are needed.
- Next.js 16 uses `src/proxy.ts`, not `middleware.ts`.
- `next.config.ts` turns on `cacheComponents` and `partialPrefetching`. Data fetching is dynamic by default and is cached only with `use cache`; pages get a static shell and dynamic parts stream in. Do not add a `runtime` route segment export. Docs: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`.
- The schema is in `supabase/migrations/0001_init.sql`. `user_id` defaults to `auth.uid()`. `meal_entries` points at a custom food through `(custom_food_id, user_id)`, so an entry can only use the same user's food. Known conflict: deleting a custom food that an entry uses fails, because `on delete set null` breaks the "exactly one source" check. MVP has no custom food delete.
- Food values come from `docs/requirements/food-list.md`. Two carb values are estimates and carry `isEstimate` (R3).
- The sample plan never repeats a dish within one day (D1). A target above about 2,131 kcal cannot reach ±10% and the plan shows the gap.
- Water target: body weight × 35 ml, plus 0 / 300 / 500 ml by activity level (D3).

## Hooks

Defined in `.claude/settings.json`, scripts in `.claude/hooks/`. Each one exits with code 2 to block.

| Hook | Blocks or asks |
|---|---|
| `block-forbidden-command.sh` | Push to `feat/nutrition-coach` or `main` (direct, HEAD, `--all`, `--mirror`); staging `.env*` or `playwright/.auth/` |
| `block-destructive-db.sh` | `supabase db reset`, `projects delete`, `migration repair`, `db push --include-all`; `DROP TABLE/SCHEMA/DATABASE`, `TRUNCATE`, `DELETE FROM` without `WHERE` |
| `protect-secrets.sh` | Reading or changing `.env*.local` and `playwright/.auth/**`. `.env.example` is allowed |
| `protect-migrations.sh` | Changing an existing file in `supabase/migrations/`. Add a new numbered file instead |
| `protect-approved-docs.sh` | Asks before changing `docs/spec/`, `docs/design/`, `docs/requirements/` |
| `require-test-first.sh` | Creating a source file before its test exists (`__tests__/<name>.test.ts`, or `index.test.tsx` for components) |
| `approve-merge.sh` | Asks before every merge (gate 3) |
| `check-commit-message.sh` | Commit message must be one line `<type>: <summary>`, at most 72 characters; no body, no trailers, `-m` or `-F` required |
| `check-branch-base.sh` | New branch or worktree must start from `github/feat/nutrition-coach` |
| `format-on-edit.sh` | Runs Prettier on `.ts`, `.tsx`, `.js`, `.json`, `.css`; skips Markdown |

Hook tests: `.claude/hooks/test-hooks.sh` (run by hand after any hook change; needs `jq`).

## Skills and subagents

Skills in `.claude/skills/`. Run by the user only, except `do-tdd`:

- `/do-task <ticket>`: one ticket from start to merge. Stops at three gates: ticket plan, before push, before merge.
- `/do-tdd <seam>`: red-green-refactor at an agreed seam. Used by `do-task`.
- `/check-release [branch]`: checks a ticket branch is ready to merge. Reports only.
- `/publish-tickets`: creates one GitHub issue per ticket that has none, and writes `**Issue:** #n` into the ticket.

Subagents in `.claude/agents/`, read-only:

- `spec-checker`: each acceptance criterion of a ticket, met or not, with its test.
- `rls-auditor`: user_id filters, `requireUser()`, RLS policies and no service role key (data tickets).

Use the built-in Explore agent to confirm a library API in `node_modules/` before writing code against it.

## MCP servers

`.mcp.json`:

- `playwright`: browser for checking the UI.
- `github`: remote GitHub MCP server. The token comes from `GITHUB_PERSONAL_ACCESS_TOKEN` in the shell and is never written to a file.

GitHub work (issues, labels, PRs, reviews, merges) goes through the GitHub MCP. The `gh` CLI is not installed. Git itself (branch, commit, push) uses `git`. There is no Supabase MCP server: database changes go through migration files only.

## Code conventions

- TypeScript strict. `@/` alias to `src/`.
- Files camelCase; components PascalCase in their own folder; hooks and stores `useXxx`.
- Each folder has an `index.ts` that re-exports its files.
- Zod schemas on the server before any write.
- Tests: `src/**/__tests__/<name>.test.ts` for functions, constants, schemas, stores and hooks; `src/components/<Name>/index.test.tsx` for components. Expected values come from the spec, the food list or a worked example, never from the code under test.
- No `console.log`, no `TODO`, no secrets in the diff.

## Git

- Remote: `github` (`uyenho-agilityio/ai-training`). `origin` is GitLab and is not used here.
- Integration branch: `feat/nutrition-coach`. Every PR targets it. Never push to it or to `main`.
- Branch names: `feat/nc-<ticket>-<short>` for tickets; `chore/` or `docs/` for setup and docs. No random suffixes. Example: `feat/nc-01-sign-in`.
- Branch from `github/feat/nutrition-coach`.
- Commit message: exactly one line, `<type>: <summary>`, no body, no `Co-Authored-By` or other trailer lines. Types: feat, fix, docs, chore, refactor, test, style, perf, ci, build.
- Commit and push only when asked.

## Parallel sessions

- A session owns one ticket and ends in one PR. It runs in its own worktree and branch.
- At most two sessions at once, and only when their tickets do not depend on each other.
- Two sessions never change the same file. The wave table in `docs/plan/claude-setup.md` says who owns what.
- Shared files (`CLAUDE.md`, `globals.css`, `src/theme/*`, `package.json`, `(app)/today/page.tsx`, `src/components/index.ts`) change in one session per wave.
- Sync the branch with `github/feat/nutrition-coach` before a PR.

## Do not guess

- Confirm library APIs in `node_modules/` (Next.js 16 docs under `node_modules/next/dist/docs/`, Tailwind 4 and `@supabase/ssr` types) before writing code.
- If a rule or number is not in the spec, the intake answers or the food list, ask. Do not invent it.
- If a ticket seam is not agreed, stop and ask.

## UI

Read `docs/design/ui_ux_branding.md` before any UI work, and follow it. When a ticket adds a new visual rule, update that file in the same PR.

## Keeping this file current

Every ticket that adds a rule updates this file in the same PR.
