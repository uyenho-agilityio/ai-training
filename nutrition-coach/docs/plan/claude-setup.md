# Claude Code setup: Nutrition Coach

Part of `docs/plan/plan.md`. Built in ticket 00a; used by every ticket after it.

## Ground rules

The project gets its own Claude Code setup before any feature work. Ground rules:

- This repo holds several apps, so the config lives **inside `nutrition-coach/`**, and Claude Code is started from that folder (`cd nutrition-coach && claude`). Only the GitHub workflows sit at the repo root.
- The integration branch is **`feat/nutrition-coach`**, not `main`. Every ticket branch is cut from it and every PR targets it.
- The GitHub remote is `github` → `uyenho-agilityio/ai-training`. `origin` is GitLab and is not used for this flow. The GitHub default branch is `feat/nutrition-coach` (A8, done), so `Closes #n` in a PR closes its issue on merge. Skills still name the base branch explicitly.
- **GitHub work goes through the GitHub MCP server**, not the `gh` CLI (it is not installed): issues, labels, PRs, reviews and merges. Git itself (branch, commit, push) uses `git`.
- Package manager is **pnpm**.
- **Guardrails are hooks.** Each hook covers every tool that could break its rule, and exits with code 2 to block.
- **`CLAUDE.md` is the main instruction file.** If `create-next-app` generates an `AGENTS.md` with the Next.js agent rules (as it did for `todo-app-copilotkit`), it is kept as is and `CLAUDE.md` starts with `@AGENTS.md`. Project rules go in `CLAUDE.md` only.
- **TDD for every ticket.** The project has its own skill, `do-tdd`, which `/do-task` uses to build: the seams to test are agreed with you first, then one failing test → the least code that makes it pass → the next test. Refactoring happens in the review step, not inside the loop. Every folder with code that can run is unit tested with Vitest, components included; Playwright tests the whole user flow end to end.
- Skills are named verb + noun, because they are run as commands: `/do-task`, `/do-tdd`, `/check-release`. Subagents are named after their role: `spec-checker`, `rls-auditor`.

## Instructions

| File | What it holds |
|---|---|
| `CLAUDE.md` | Written by hand in 00a from the spec, design and `docs/plan/`, then checked against the code with `/init` after 00b. Sections: Project, Commands (`pnpm dev/build/lint/typecheck/test/e2e`), Stack (spec "Architectural decisions"), Architecture (the `src/` layout from `code-structure.md`), Styling (Tailwind utility classes in `className`, tokens only in `src/theme/`, no `style` prop, no CSS modules), Things to know (Asia/Ho_Chi_Minh dates, values copied at logging time, RLS + `requireUser()` on every action, no service role key in app code, `proxy.ts` not `middleware.ts`, the single OAuth callback route), Hooks (what each one blocks), Skills and subagents, MCP servers, Code conventions, Git (remote `github`, base `feat/nutrition-coach`, branch `<type>/<short-name>`, commit message is exactly one line `<type>: <summary>`, with no body and no trailer lines; commit or push only when asked), Parallel sessions (rules below), Do not guess, UI (read `docs/design/ui_ux_branding.md` first; update it when a new visual rule is added). Every later ticket that adds a rule updates `CLAUDE.md` in the same PR |
| `.mcp.json` | `playwright` (`npx @playwright/mcp@latest`) and `github` (remote HTTP server, token from `${GITHUB_PERSONAL_ACCESS_TOKEN}`, never written in the file). No Supabase MCP server: database changes go through migration files only |

## Hooks (`.claude/settings.json` + `.claude/hooks/`, scripts need `jq`)

| Hook | Event / matcher | What it enforces |
|---|---|---|
| `block-forbidden-command.sh` | PreToolUse `Bash` | No `git push` to `feat/nutrition-coach` or `main` (direct, `HEAD` on those branches, `--all`, `--mirror`, forced or not). No `git add` of `.env*` or `playwright/.auth/` |
| `block-destructive-db.sh` | PreToolUse `Bash` | No `supabase db reset` (with or without `--linked`), `supabase projects delete`, `supabase migration repair`, `supabase db push --include-all`; no SQL with `DROP TABLE/SCHEMA/DATABASE`, `TRUNCATE`, or `DELETE FROM` without `WHERE`, whether run through `psql`, `supabase db execute` or a piped file |
| `protect-secrets.sh` | PreToolUse `Read\|Edit\|Write\|Bash` | No reading or changing `.env*.local` or `playwright/.auth/**`, including through `cat`, `grep`, `head`, `cp` or `source`. `.env.example` is allowed |
| `protect-migrations.sh` | PreToolUse `Edit\|Write` | A file that already exists in `supabase/migrations/` cannot be changed; a schema change is a new numbered migration |
| `protect-approved-docs.sh` | PreToolUse `Edit\|Write` | Changing `docs/spec/`, `docs/design/` or `docs/requirements/` asks you first. Ticket files and `docs/plan/` stay editable, so `/do-task` can update status |
| `require-test-first.sh` | PreToolUse `Write` | Creating a source file is blocked until its test exists: `src/<folder>/<name>.ts` needs `src/<folder>/__tests__/<name>.test.ts` (for `utils`, `constants`, `schemas`, `stores`, `hooks`), and `src/components/<Name>/index.tsx` needs `src/components/<Name>/index.test.tsx`. `index.ts` re-export files, `src/utils/supabase/**`, `icons`, `types` and `theme` are not checked. This is the hard check behind `do-tdd`: the skill says how to work, the hook makes sure the test file comes first |
| `format-on-edit.sh` | PostToolUse `Edit\|Write` | Runs Prettier on `.ts`, `.tsx`, `.js`, `.json`, `.css`; skips Markdown so tables in `docs/` keep their layout |
| `approve-merge.sh` | PreToolUse `mcp__github__merge_pull_request` | Every merge asks you first and shows the PR number, title, CI state and review verdict. This is approval gate 3 in "Ticket lifecycle" |
| `check-commit-message.sh` | PreToolUse `Bash` | A `git commit` is blocked unless its message is one line `<type>: <summary>` (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`, `ci`, `build`; summary at most 72 characters) and nothing else: no body, no trailer lines such as `Co-Authored-By`. `git commit` without `-m` or `-F` (which opens an editor) is blocked too |
| `check-branch-base.sh` | PreToolUse `Bash` | A new branch or worktree (`git switch -c`, `git checkout -b`, `git branch <name>`, `git worktree add -b`) is blocked unless it starts from `github/feat/nutrition-coach` (or local `feat/nutrition-coach` at the same commit). A missing start point counts as the current branch, so it is blocked unless you are on `feat/nutrition-coach` |
| `test-hooks.sh` | Not a hook; run by hand | Feeds sample tool calls to each hook and checks the exit codes listed in "Proof for 00a" below |

## Skills (`.claude/skills/<name>/SKILL.md`, run by you only: `disable-model-invocation: true`)

| Skill | SDLC stage | What it does |
|---|---|---|
| `do-task` | Build → Review → Test → Merge | `/do-task [--auto] <docs/tickets/<ticket>-*.md or issue link>` takes one ticket from start to merged, following "Ticket lifecycle" below. It stops only at the three approval gates: (1) the ticket plan and its test seams, in plan mode; (2) the diff, commit message and PR body, before anything is pushed; (3) the merge. Everything else it does itself: issue label `status: in progress` → worktree and branch `<type>/nc-<ticket>-<short>` from `github/feat/nutrition-coach` → build with `/do-tdd` → review with `/code-review`, `/security-review`, `spec-checker` and `rls-auditor` (data tickets) as subagents, then fix real findings → `pnpm lint && pnpm typecheck && pnpm test && pnpm build` (+ `pnpm e2e` when the UI changes), fix loop at most 3 rounds → commit, push, open the PR with GitHub MCP (base `feat/nutrition-coach`, body with `Closes #<issue>`), label `status: in review`, start `/loop` from `loop.md` to watch the PR → fix CI failures and review comments that are inside the ticket, push again → after merge: delete the branch, remove the worktree, sync the base. The ticket file gets `Status: done` and its checkboxes ticked inside the PR, so it reads "done" exactly when the PR merges. PR body: Ticket (number, issue, US n), Problem, Changes, Testing, Review findings acted on, Not tested, Follow-up. `--auto` skips gate 1 only for setup tickets; gates 2 and 3 always stop |
| `do-tdd` | Build | Used by `/do-task` for every ticket, and can be run on its own as `/do-tdd <seam>`. Steps: read the agreed seams for the ticket → for each slice: write **one** failing test at the seam (Vitest in `__tests__/` for functions, constants, schemas, stores and hooks; Vitest + Testing Library in `index.test.tsx` for components; Playwright for a step of the user flow) and run it to see it fail for the right reason → write the least code that makes it pass → run it green → commit test and code together → next slice. Rules: expected values come from the spec, the food list or a worked example, never recomputed the way the code does; only Supabase, Server Actions (in component tests), the clock and the random source may be replaced; component tests check what the user sees and does (text, roles, clicks), not internal state; no test of internals or private functions; no refactor inside the loop. Stops and asks when a seam is not agreed |
| `check-release` | Release | `/check-release [branch]` checks that a ticket branch is ready to merge into `feat/nutrition-coach` (run by `/do-task` before gate 3, or on its own): branch state vs `github/feat/nutrition-coach`, open PR and its review comments (GitHub MCP), `pnpm install --frozen-lockfile` + lint + typecheck + test + build, Vercel preview status (**not checked** until the project exists), docs match code (env vars in `README.md` + `CLAUDE.md` + `.env.example`; new tables in `docs/design/database_schema.md` and a new migration; new visual rules in `ui_ux_branding.md`; ticket status and checkboxes), leftovers (`console.log`, `TODO`, secrets, `.env` or `playwright/.auth/` in the diff), and a list of manual checks. Reports only, never merges |
| `publish-tickets` | Plan → Build | `/publish-tickets` creates one GitHub issue per file in `docs/tickets/` that has no issue yet, with GitHub MCP: title `<ticket>: <name>`, body from the ticket, labels `nutrition-coach` and `status: todo`. It writes the issue number back into the ticket (`**Issue:** #n`). Shows the list and asks once before creating. Run once in 00a, and again when a ticket is added |

## Subagents (`.claude/agents/<name>.md`, read-only tools)

A subagent is a helper with its own context window. The main session gives it one job, the helper reads whatever it needs (spec, ticket, diff, tests, `node_modules/` docs), and only its short report comes back. The files it read stay out of the main session's context, so the main session keeps room for the ticket itself. Subagents only read and report; the main session makes every change.

Where they are used in `/do-task`:

```
main session (one ticket)
  ├─ analyse: Explore ──────────────▶ "Next 16 uses proxy.ts; @supabase/ssr API is …"
  ├─ build with /do-tdd (main session writes tests and code)
  └─ review:
       ├─ /code-review ─── starts its own subagents ──▶ list of findings
       ├─ spec-checker ──────────────────────────────▶ criteria met / not met
       └─ rls-auditor (tickets that touch data) ─────▶ gaps in user_id / RLS
     main session reads the reports, fixes the real findings, runs the checks again
```

| Agent | Kind | Called by | What it reports |
|---|---|---|---|
| Explore | Built in | `/do-task` analyse step, and any time a library API must be confirmed | The API as it exists in the installed version (`node_modules/next/dist/docs/`, `node_modules/tailwindcss`, `@supabase/ssr` types) |
| `/code-review` helpers | Built in, started by `/code-review` itself | `/do-task` review step | Bugs in the diff and breaks of `CLAUDE.md` rules |
| `spec-checker` | Project (`.claude/agents/`) | `/do-task` review step, every ticket | Each acceptance criterion of the ticket and its user story: met / not met / not provable, with the test that proves it. Also flags a criterion with no test at an agreed seam, a test that recomputes its expected value the way the code does, and a test that mocks the project's own modules (only Supabase, Server Actions in component tests, time and randomness may be replaced), and a source file without its test file |
| `rls-auditor` | Project (`.claude/agents/`) | `/do-task` review step for 00b, T01, T03, T04, T05, T06 | Every query in `src/utils/supabase/queries/` filters by `user_id`; every Server Action calls `requireUser()`; every table has RLS with `using` and `with check` on `user_id = auth.uid()`; no service role key in `src/` |

Subagents have no limit on how many run at once; they are light, and they keep the main session's context small. In the review step `/code-review`, `spec-checker` and `rls-auditor` run together.

## GitHub workflows (repo root)

| File | What it does |
|---|---|
| `/.github/workflows/nutrition-coach-ci.yml` | On PRs into `feat/nutrition-coach`: `pnpm install --frozen-lockfile`, `lint`, `typecheck`, `test`, `build` with `working-directory: nutrition-coach`. No e2e in CI (spec: Google sign-in is manual) |
| `/.github/workflows/nutrition-coach-code-review.yml` | Runs `/code-review:code-review --comment` on PRs into `feat/nutrition-coach` that touch `nutrition-coach/src/**`, `nutrition-coach/supabase/**`, `nutrition-coach/package*.json` or config files. Needs the repo secret `CLAUDE_CODE_OAUTH_TOKEN` |

The existing `/.github/workflows/claude.yml` (answers `@claude` in issues and PRs) gets one change: it authenticates with `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` instead of `anthropic_api_key`, so it runs on your subscription. Nothing else in it changes. No separate `DESIGN.md`: `CLAUDE.md` points to `docs/design/ui_ux_branding.md`.

## Loop

| File | What it holds |
|---|---|
| `loop.md` | "PR check": run by `/do-task` after the PR opens (`/loop 10m check the PR, following loop.md`). Each run reads the PR's CI state and new review comments with GitHub MCP, fixes what is inside the ticket and pushes, and reports one line when nothing changed. It stops when the PR is merged or closed, or after the same failure 3 runs in a row. A "Deploy check" section is added once the Vercel project exists |

## Later, not in 00a

Added only when there is a need: a Stop hook with a macOS notification and a `/standup` command.

## Order and git flow

The order follows the "Blocked by" lines in the tickets: 00a has no blocker; 00b needs 00a; T01 needs 00b; T02, T03, T09 need T01; T04 and T10 need T03; T05, T06, T07, T08 need T04. Every ticket is built test-first (see "TDD seams" in `test-strategy.md`).

Git flow: each ticket is one branch cut from `github/feat/nutrition-coach`, named `<type>/nc-<ticket>-<short>` (for example `chore/nc-00a-claude-setup`, `feat/nc-01-sign-in`), with commits `<type>: <summary>` that mention the ticket. 00a is done by hand, because `/do-task` does not exist yet; it still goes through a PR, and `/publish-tickets` creates the issues at its end. From 00b on, every ticket is run with `/do-task docs/tickets/<ticket>-*.md`, which follows "Ticket lifecycle" below from start to merge. Nothing is pushed to `feat/nutrition-coach` directly; the hook blocks it.

## Ticket lifecycle

One ticket = one GitHub issue = one branch = one PR. Claude does every step except the three gates (⛔), which wait for you.

| # | Step | Who | Issue | Ticket file |
|---|---|---|---|---|
| 1 | `/do-task <ticket>`: label the issue, create the worktree and branch | Claude | `status: in progress` | – |
| 2 | Plan mode: ticket plan and test seams | ⛔ Gate 1: you approve | | |
| 3 | Build with `/do-tdd`, review with subagents, fix, run all checks | Claude | | |
| 4 | Diff, commit message and PR body shown | ⛔ Gate 2: you approve or edit | | `done` set in the PR |
| 5 | Commit, push, open the PR with `Closes #n`, start `/loop` on the PR | Claude | `status: in review` | |
| 6 | CI and the review workflow run on GitHub; findings inside the ticket are fixed and pushed; `@claude` can be asked for more | Claude (you can comment) | | |
| 7 | `/check-release` report, then merge with GitHub MCP | ⛔ Gate 3: the `approve-merge.sh` hook asks you | | |
| 8 | Merge closes the issue (`Closes #n` on the default branch); branch deleted, worktree removed, base synced, loop stopped | Claude / GitHub | closed = done | `done` lands with the merge |

A new push after gate 2 that only fixes CI or review findings inside the ticket does not stop again; anything outside the ticket goes to Follow-up and asks you first.

## Parallel sessions

A **session** owns one ticket at a time and ends in a PR. Each session runs in its own git worktree and branch, cut from `github/feat/nutrition-coach` (for example `claude --worktree nc-01-sign-in`). **At most two sessions run at once**, and only when their tickets do not depend on each other, to keep the machine load and token use down. A **subagent** works inside a session, only reads and reports, and never gets a ticket of its own (see "Subagents" above).

| Wave | Session A | Session B | Why these can run together |
|---|---|---|---|
| 1 | 00a, then 00b | – | Everything depends on them |
| 2 | T01 | T03, pure part only (`utils/targets.ts`, `constants/nutrition.ts`, `schemas/profile.ts` + tests) | The pure part needs neither Supabase nor T01, so it can start while R7 (`decisions.md`) is open |
| 3 | T02, then T09 (both change `Header/` and `(app)/layout.tsx`, so one session) | T03, rest of it (after T01 is merged and the branch is synced) | No shared files |
| 4 | T04 (after T03 is merged) | T10, pure part only (`utils/waterTarget.ts` + tests) | Both need T03; T10's pure part touches no T04 file |
| 5 | T05, then T07 | T06 | T05 owns `EntryList/` and `actions/mealEntries.ts`; T07 owns `TotalsCards/`; T06 owns `queries/customFoods.ts`, `CustomFoodForm/`, `add-food/page.tsx`, `actions/foods.ts` |
| 6 | T08, then T10 rest of it (`WaterTargetCard/`, its place on `today/page.tsx`) | – | Both change `today/page.tsx`, so one session, one after the other |
| 7 | Plan step 9: full e2e run and README | – | Needs every ticket merged |

Rules for every wave:

- Two sessions never change the same file. The table above says who owns which file. If a ticket needs a file another running session owns, it waits for that PR to merge.
- Shared files (`CLAUDE.md`, `globals.css`, `src/theme/*`, `package.json`, `today/page.tsx`, `src/components/index.ts`) are changed by one session per wave. New dependencies are added only in 00b, or after you agree.
- Before opening a PR, the session syncs its branch with `github/feat/nutrition-coach` and runs the checks again.
- PRs merge one at a time, in the order of the table (in wave 5: T05, T07, then T06). After each merge, the other open branch syncs.
- The session that starts a ticket sets its `Status:` to `in progress` in its first commit, and the wave table is the source of who owns what.

## Proof for 00a: hook tests

Each hook is tested by piping a sample tool-call JSON (for example `{"tool_name":"Bash","tool_input":{"command":"..."}}`) into the script and checking the exit code: 2 = blocked, 0 = allowed. The cases live in `.claude/hooks/test-hooks.sh`, so they can be run again after any hook change.

| Hook | Input | Expected |
|---|---|---|
| `block-forbidden-command.sh` | `git push github feat/nutrition-coach` | blocked |
| | `git push github HEAD` while on `feat/nutrition-coach` | blocked |
| | `cd x && git push --force github main` | blocked |
| | `git push github --all` | blocked |
| | `git add -f .env.local` / `git add playwright/.auth/user.json` | blocked |
| | `git push -u github feat/nc-01-sign-in` | allowed |
| `block-destructive-db.sh` | `supabase db reset` / `supabase db reset --linked` | blocked |
| | `psql "$DB_URL" -c "DROP TABLE meal_entries"` | blocked |
| | `supabase db execute -f wipe.sql` where the file has `TRUNCATE` | blocked |
| | `psql ... -c "DELETE FROM meal_entries"` (no `WHERE`) | blocked |
| | `supabase migration new add_index` / `supabase db diff` | allowed |
| `protect-secrets.sh` | Read `.env.local` | blocked |
| | Bash `cat .env.local`, `grep KEY .env.production.local`, `cat playwright/.auth/user.json` | blocked |
| | Read or Edit `.env.example` | allowed |
| `protect-migrations.sh` | Edit `supabase/migrations/0001_init.sql` once it exists | blocked |
| | Write a new `supabase/migrations/0002_*.sql` | allowed |
| `approve-merge.sh` | `mcp__github__merge_pull_request` for any PR | asks you |
| `check-commit-message.sh` | `git commit -m "docs: add build plan and setup tickets for Nutrition Coach"` | allowed |
| | A message with a body paragraph or a `Co-Authored-By` line, a subject without `<type>:`, or a subject over 72 characters | blocked |
| `protect-approved-docs.sh` | Edit `docs/spec/spec.md` | asks you |
| | Edit `docs/tickets/01-sign-in-with-google.md` or `docs/plan/plan.md` | allowed |
| `require-test-first.sh` | Write `src/utils/targets.ts` before `src/utils/__tests__/targets.test.ts` exists | blocked |
| | Write `src/components/TotalsCards/index.tsx` before `index.test.tsx` exists | blocked |
| | Write either after its test exists; write `src/utils/supabase/auth.ts`, `src/utils/index.ts` or an icon | allowed |
| `check-branch-base.sh` | `git switch -c feat/nc-04-log-food github/feat/nutrition-coach` | allowed |
| | `git switch -c feat/nc-05-delete` while on `feat/nc-04-log-food`; `git worktree add -b x ../x main` | blocked |
| `format-on-edit.sh` | Edit a `.ts` file / a `.md` file | Prettier runs / file untouched |

Also: in each ticket's PR, the commit history shows the test commit (red) before or with the code that makes it pass; `spec-checker` reports no criterion without a test. `/mcp` lists `playwright` and `github`; `/do-task`, `/do-tdd` and `/check-release` show up as commands when Claude is started in `nutrition-coach/`; `/publish-tickets` created one issue per ticket and wrote the numbers back; running `/do-task` on 00b opens a PR with base `feat/nutrition-coach` and `Closes #n`, labels the issue `status: in review`, CI and the review workflow run on it, the merge asks you first, and after merge the issue is closed and the branch and worktree are gone.
