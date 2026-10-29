# Code structure: Nutrition Coach

Part of `docs/plan/plan.md`. All paths are under `nutrition-coach/` unless they start with `/` (repo root). The folder has no code yet, so every code file below is new.

## Work per step

The steps of `plan.md` "Order of work", with the files each one touches.

| Step | Work | Ticket / US | Done when |
|---|---|---|---|
| 0a | Claude Code setup: `CLAUDE.md`, `.mcp.json`, `.claude/settings.json`, ten hooks, `do-task`, `do-tdd`, `check-release` and `publish-tickets` skills, `loop.md`, `spec-checker` and `rls-auditor` agents, the two workflows at the repo root | 00a / none | 00a checklist proven ("Proof for 00a" in `claude-setup.md`) |
| 0b | Scaffold the project, configs, `.gitignore`, `.env.example`. Write `0001_init.sql` with all three tables and RLS. Product team applies it to the Supabase project and sets env vars. Set up Tailwind CSS 4 and `src/theme/` (light tokens, font, radius, shadows, breakpoints) and the empty `src/` folders. Run `/init` and update `CLAUDE.md` with what it finds | 00b / none | 00b checklist proven |
| 1 | Supabase clients, `proxy.ts`, `requireUser()`, Login page, OAuth callback, root redirect, `(app)` layout. Profile and Today pages are placeholders | T01 / US 1 | T01 checklist proven |
| 2 | Header with `signOut()` | T02 / US 2 | T02 checklist proven |
| 3 | `src/theme/dark.css` (dark tokens and the `dark` variant on `data-theme`), theme store, head script, theme switch. Done early so every later screen is built in both themes | T09 / US 9 | T09 checklist proven |
| 4 | `utils/targets.ts`, `constants/nutrition.ts`, `schemas/profile.ts`, `queries/profiles.ts`, `saveProfile`, Profile page with target | T03 / US 3 | T03 checklist proven |
| 5 | `constants/foods.ts`, `utils/dates.ts`, `utils/dailyTotals.ts`, `queries/mealEntries.ts`, `logFood` for built-in codes, Add food page (built-in list), Today cards and list | T04 / US 4 | T04 checklist proven |
| 6 | Delete action on each entry, `deleteMealEntry` | T05 / US 5 | T05 checklist proven |
| 7 | Negative remaining and warning in `TotalsCards/` | T07 / US 7 | T07 checklist proven |
| 8 | `schemas/customFood.ts`, `queries/customFoods.ts`, `addCustomFood`, `logFood` for custom ids, custom food form and list | T06 / US 6 | T06 checklist proven |
| 9 | `utils/samplePlan.ts` (no dish twice in a day), sample plan block on Today with the day's total vs target | T08 / US 8 | T08 checklist proven |
| 9b | `utils/waterTarget.ts`, `WaterTargetCard/` on Today | T10 / US 10 | T10 checklist proven |
| 10 | Run all `e2e/*.spec.ts` together as one flow, README, final check that every ticket is `done`. No new tests are written here; each was written in its ticket | US 1–10 | All of `test-strategy.md` passes |

## Project setup (ticket 00b, supports all tickets)

| File | Purpose |
|---|---|
| `package.json`, `pnpm-lock.yaml` | Next.js 16.4.3, React, TypeScript, Tailwind CSS 4.3 + `@tailwindcss/postcss`, `@supabase/supabase-js`, `@supabase/ssr`, Zustand, Zod, Vitest, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, Playwright, Prettier (for the format hook). Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `e2e` |
| `tsconfig.json` (strict, `@/` alias to `src/`), `next.config.ts`, `eslint.config.mjs` | Standard Next.js App Router setup |
| `vitest.config.ts`, `vitest.setup.ts` | Unit tests in `src/**/__tests__/*.test.ts(x)` and `src/components/**/index.test.tsx`; `jsdom` environment for component tests; the setup file loads `@testing-library/jest-dom` matchers |
| `playwright.config.ts` | `setup` project that saves sign-in state, `chromium` project that reuses it |
| `.gitignore` | Ignores `.env*.local`, `playwright/.auth/`, `.next/`, `node_modules/`, test reports, `.claude/settings.local.json` |
| `.env.example` | Names of the needed variables only (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), no values |
| `supabase/migrations/0001_init.sql` | `profiles`, `custom_foods`, `meal_entries`, check constraints, RLS policies (spec "Schema changes", `database_schema.md`) |

## Source layout

`src/` follows the same folder layout as the repo's `todo-app-copilotkit`: no `lib/` folder, one folder per kind of code, each with an `index.ts` that re-exports its files. Files are camelCase, except icons (PascalCase) and hooks and stores (`useXxx`). One difference: each component has its own PascalCase folder with `index.tsx` and `index.test.tsx`, instead of one flat file.

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

Test file rules are in `test-strategy.md`.

## Theme and styling (Tailwind CSS 4.3)

Styling is Tailwind utility classes in `className`. No CSS modules, no `style` prop. Shared design values are set up once in `src/theme/` and used across the whole app.

| File | Ticket / US | Purpose |
|---|---|---|
| `src/theme/index.css` | 00b | Tailwind v4 `@theme` tokens from `ui_ux_branding.md`: colors (`primary`, `background`, `surface`, `text`, `warning`, `on-primary`), font family, radius, shadow, breakpoints. Light values by default |
| `src/theme/dark.css` | T09 / US 9 | Dark values for the same tokens under `[data-theme="dark"]`, and `@custom-variant dark` bound to `data-theme`, so `dark:` classes follow the switch and not only the OS |
| `src/theme/fonts.ts` | 00b | Be Vietnam Pro through `next/font`, exposed as the `--font-sans` variable used by `@theme` |
| `src/app/globals.css` | 00b | Only `@import "tailwindcss"`, the two theme files, and base rules for `html` and `body`. Nothing component-specific |
| `postcss.config.mjs` | 00b | `@tailwindcss/postcss` |

## Functions, constants, schemas, types

| File | Ticket / US | Purpose |
|---|---|---|
| `src/utils/targets.ts` + `__tests__/targets.test.ts` | T03 / US 3 | `calculateTargets(profile) -> { kcal, proteinG, carbG, fatG }` |
| `src/utils/dailyTotals.ts` + `__tests__/dailyTotals.test.ts` | T04, T05, T07 / US 4, 5, 7 | `calculateDailyTotals(target, entries) -> { eaten, remaining }`, remaining may be negative |
| `src/utils/samplePlan.ts` + `__tests__/samplePlan.test.ts` | T08 / US 8 | `generateSamplePlan(catalog, kcalTarget, random) -> Day[7]`, no dish twice in one day |
| `src/utils/dates.ts` + `__tests__/dates.test.ts` | T04 / US 4 | `todayInVietnam(now: Date) -> 'YYYY-MM-DD'` using `Asia/Ho_Chi_Minh` |
| `src/utils/waterTarget.ts` + `__tests__/waterTarget.test.ts` | T10 / US 10 | `calculateWaterTarget({ weightKg, activityLevel }) -> ml`: weight × 35 ml plus the activity add-on (D3), whole ml |
| `src/constants/foods.ts` + `__tests__/foods.test.ts` | T04, T08 / US 4, 8 | The 20 built-in dishes, with `isEstimate` flags for carb of VPF-000094 and VPF-000193 |
| `src/constants/nutrition.ts` + `__tests__/nutrition.test.ts` | T03, T10 / US 3, 10 | Activity factors, 500 kcal deficit, macro split, water per kg (35 ml) and water add-on per activity level |
| `src/schemas/profile.ts` + `__tests__/profile.test.ts` | T03 / US 3 | Zod schema for the profile form |
| `src/schemas/customFood.ts` + `__tests__/customFood.test.ts` | T06 / US 6 | Zod schema for the custom food form |
| `src/types/index.ts` | T03, T04 | `Profile`, `ActivityLevel`, `Targets`, `Food`, `MealEntry`, `Day` |

## Server side (data access, session guard, actions)

| File | Ticket / US | Purpose |
|---|---|---|
| `src/utils/supabase/server.ts`, `client.ts` | T01 / US 1 | Supabase clients for Server Components / Actions and for the browser (sign-in button only) |
| `src/utils/supabase/auth.ts` | T01, T02 / US 1, 2 | `requireUser()`: returns the user or redirects to `/login` (session guard) |
| `src/utils/supabase/queries/profiles.ts` | T01, T03 / US 1, 3 | `getProfile(userId)`, `upsertProfile(userId, input)` |
| `src/utils/supabase/queries/customFoods.ts` | T06 / US 6 | `listCustomFoods(userId)`, `insertCustomFood(userId, input)`, `getCustomFood(userId, id)` |
| `src/utils/supabase/queries/mealEntries.ts` | T04, T05 / US 4, 5 | `listEntries(userId, date)`, `insertEntry(...)`, `deleteEntry(userId, id)` |
| `src/proxy.ts` | T01 / US 1 | Refreshes the Supabase session cookie on each request (Next.js 16 name for middleware) |
| `src/app/actions/profile.ts` | T03 / US 3 | `saveProfile(input)` |
| `src/app/actions/foods.ts` | T04, T06 / US 4, 6 | `logFood(source, date)`, `addCustomFood(input)` |
| `src/app/actions/mealEntries.ts` | T05 / US 5 | `deleteMealEntry(id)` |
| `src/app/actions/auth.ts` | T02 / US 2 | `signOut()` |
| `src/app/auth/callback/route.ts` | T01 / US 1 | Google sign-in callback, then redirect to `/profile` (no profile) or `/today` (see D2) |

## Pages, components, stores

Each `src/components/<Name>/` folder holds `index.tsx` and `index.test.tsx`.

| File | Ticket / US | Purpose |
|---|---|---|
| `src/app/layout.tsx` | T09 / US 9 | `<html>` with the theme script in `<head>` and the font variable |
| `src/app/page.tsx` | T01 / US 1 | Redirects to `/login`, `/profile` or `/today` |
| `src/app/login/page.tsx`, `src/components/GoogleSignInButton/` | T01 / US 1 | One button: "Continue with Google" |
| `src/app/(app)/layout.tsx` | T01, T02, T09 / US 1, 2, 9 | Calls `requireUser()`, renders the header |
| `src/app/(app)/profile/page.tsx`, `src/components/ProfileForm/` | T03 / US 3 | Profile form and the target shown after save |
| `src/app/(app)/today/page.tsx` | T04, T05, T07, T08, T10 / US 4, 5, 7, 8, 10 | Target / eaten / remaining cards, water target, today's list, "Add food" button, sample plan |
| `src/app/(app)/add-food/page.tsx`, `src/components/CustomFoodForm/`, `src/components/FoodPicker/` | T04, T06 / US 4, 6 | Built-in list, saved custom foods, new custom food form |
| `src/components/Header/`, `src/components/SignOutButton/` | T02 / US 2 | Header with sign out |
| `src/components/TotalsCards/` | T04, T07 / US 4, 7 | Three cards; negative remaining + soft warning |
| `src/components/WaterTargetCard/` | T10 / US 10 | Today's water target in ml |
| `src/components/EntryList/` | T04, T05 / US 4, 5 | Today's entries with a delete action |
| `src/components/SamplePlan/` | T08 / US 8 | Seven day tabs, three meals each, the day's total vs target, no log action |
| `src/components/ThemeScript/`, `src/components/ThemeSwitch/` | T09 / US 9 | Inline head script that sets `data-theme` before paint; the switch in the header |
| `src/components/index.ts`, `src/icons/index.ts` | All UI | Re-exports |
| `src/stores/useThemeStore.ts` + `__tests__/useThemeStore.test.ts` | T09 / US 9 | Zustand + `persist`, key `nc-theme`, values `light` / `dark` / `system`, default `system` |

## End-to-end tests

| File | Ticket / US | Purpose |
|---|---|---|
| `e2e/auth.setup.ts` | T01 / US 1 | Manual Google sign-in once, saves `playwright/.auth/user.json` (never committed) |
| `e2e/<ticket>-*.spec.ts` (for example `e2e/04-log-built-in-food.spec.ts`) | T01–T10 / US 1–10 | One file per ticket, written red-first inside that ticket, so parallel sessions never edit the same test file. Together they cover the flow in the spec "Testing Decisions" |

Unit tests (Vitest) cover every folder in the test table in `test-strategy.md`, components included. Playwright tests the whole user flow (D7).

## Docs

| File | Change |
|---|---|
| `docs/tickets/00a`, `00b`, `01`–`10` | New: `00a-claude-code-setup.md`, `00b-project-scaffold.md`, `10-water-target.md`; T01 gets `Blocked by: 00b`. For all: `Status:` moves `todo` → `in progress` → `in review` → `done`, matching the issue labels; checkboxes ticked when proven |
| `docs/spec/spec.md` | Ticket status uses four states (`todo`, `in progress`, `in review`, `done`); issues are published now that the repo is connected. Add user story 10 (water target) and remove "Only the water target is shown" from Out of Scope; add "no dish twice in one day" to the sample plan generator; Tailwind CSS 4 under Architectural decisions; fix the design file names (`01_ui_ux_branding.md` → `ui_ux_branding.md`, etc.). Done in 00a with your OK, before the docs hook is on |
| `docs/requirements/intake-questions.md` | Q07 and Q09 updated to the answers in D1 and D3; the water line in `team-decisions.md` updated the same way |
| `README.md` | How to run, test and set env vars; start Claude Code from `nutrition-coach/`; project status |
