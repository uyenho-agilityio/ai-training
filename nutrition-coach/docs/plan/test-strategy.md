# Test strategy: Nutrition Coach

Part of `docs/plan/plan.md`. TDD for every ticket (`/do-tdd`): agree the seams, one failing test, the least code to pass it, the next test.

## Test files

Test files follow two rules:

```
src/utils/                         src/components/
├── targets.ts                     └── TotalsCards/
├── dailyTotals.ts                     ├── index.tsx
└── __tests__/                         └── index.test.tsx
    ├── targets.test.ts
    └── dailyTotals.test.ts
```

| Folder | Unit test | Notes |
|---|---|---|
| `utils/`, `constants/`, `schemas/` | `__tests__/<file>.test.ts`, one per source file | Pure functions and data |
| `stores/`, `hooks/` | `__tests__/<file>.test.ts` | Through the store or hook's public API |
| `components/` | `<Name>/index.test.tsx` | Render with Testing Library and check what the user sees and does. Server Actions are replaced, since they are the boundary to the server |
| `app/` pages | `__tests__/page.test.tsx` next to a page that is a client or non-async component | An async Server Component page cannot be rendered by Vitest. Those pages stay thin (read data, pass it to components), and Playwright covers them |
| `icons/`, `types/`, `theme/` | none | No logic: drawings, compile-time types, CSS |
| `utils/supabase/` | none | Needs a live database; covered by Playwright and `rls-auditor` |

## TDD seams

Each ticket starts with its seams agreed (the `/do-task` plan stop), and `/do-tdd` writes tests only at those seams. These are the proposed defaults; the ticket plan can change them with your OK. Expected values come from the spec, the food list or a worked example by hand, never from the code under test. Only Supabase, Server Actions (in component tests), the clock and the random source are replaced in tests; `todayInVietnam(now)` and `generateSamplePlan(..., random)` take them as arguments for that reason.

| Ticket | Unit seams (Vitest) | Flow seams (Playwright) |
|---|---|---|
| 00b | One sample test in `src/utils/__tests__/` and one component test run green, proving both setups | One sample e2e test runs green; RLS by the SQL check in "Data isolation" below |
| T01 | `GoogleSignInButton`: shows "Continue with Google" and calls sign-in on click | Signed-out visit to `/today` → `/login`; signed-in with no profile → `/profile`; with a profile → `/today` |
| T02 | `SignOutButton`: calls sign-out on click; `Header`: shows the sign-out button | Sign out from the header → Login screen; `/today` then redirects to `/login` |
| T03 | `calculateTargets` with hand-worked values for both formulas; `constants/nutrition`; profile schema accepts and rejects; `ProfileForm`: shows an error for invalid input and the target after save | Save profile → target shown; change weight → target changes |
| T04 | `foods` (20 dishes, estimates flagged); `todayInVietnam` at the midnight boundary; `calculateDailyTotals`; `FoodPicker`: logs the chosen dish; `TotalsCards`: shows target, eaten, remaining; `EntryList`: shows today's rows | Log a dish → row added, remaining goes down |
| T05 | `EntryList`: delete calls the action for that row | Delete a row → totals return to before |
| T06 | Custom food schema; `CustomFoodForm`: rejects an empty name and negative numbers, submits a valid food | Create and log a custom food → row added and saved for later |
| T07 | `calculateDailyTotals` over target → negative remaining; `TotalsCards`: negative value shows the warning | Go over target, warning shows, one more dish can still be logged |
| T08 | `generateSamplePlan` with a fixed random source (7 days, 3 meals, no dish twice in a day, ±10% or closest of 5); `SamplePlan`: switching days shows three meals and the day's total, with no log action | Open a plan day → today's list is unchanged |
| T09 | `useThemeStore`: default `system`, choice is persisted; `ThemeSwitch`: choosing dark sets `data-theme="dark"` | Choose dark, reload → still dark before first paint |
| T10 | `calculateWaterTarget` with the D3 examples; `WaterTargetCard`: shows the amount in ml | Change weight or activity in Profile → Today's water target changes |

## Commands (all must pass before a ticket is marked `done`)

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

```bash
pnpm e2e
```

## Unit tests (Vitest)

| Module | What the tests show | Ticket / US |
|---|---|---|
| `utils/targets.ts` | Known Mifflin-St Jeor result for male and female; known Katch-McArdle result when body fat % is set; each of the 5 activity factors; −500 kcal; protein = 2 × kg; fat = 25% of kcal ÷ 9; carbs = rest ÷ 4; whole numbers | T03 / US 3 |
| `schemas/profile.ts`, `schemas/customFood.ts` | Missing or out-of-range profile fields are rejected with a message; custom food needs a name and non-negative numbers | T03, T06 / US 3, 6 |
| `constants/foods.ts` | Exactly 20 dishes; codes unique; VPF-000019 absent; VPF-000094 carb 0 and VPF-000193 carb 4 have `isEstimate` | T04 / US 4 |
| `utils/dates.ts` | 2026-10-28T16:59:59Z → `2026-10-28`; 2026-10-28T17:00:00Z → `2026-10-29` | T04 / US 4 |
| `utils/dailyTotals.ts` | Empty day = full target remaining; one entry; several entries; over target gives negative remaining | T04, T05, T07 / US 4, 5, 7 |
| `utils/samplePlan.ts` | With a fixed random source: 7 days, each has breakfast, lunch and dinner from the right meal types and no dish twice; a reachable target gives days within ±10%; an unreachable target (e.g. 2,500 kcal) returns the closest of 5 tries; output is the same for the same seed | T08 / US 8 |
| `utils/waterTarget.ts` | 70 kg, light → 2,450 ml; 70 kg, moderate → 2,750 ml; 80 kg, active → 3,300 ml; 80 kg, very active → 3,300 ml; sedentary gets no add-on | T10 / US 10 |
| `constants/nutrition.ts` | Activity factors 1.2, 1.375, 1.55, 1.725, 1.9; deficit 500; water 35 ml per kg and add-ons +0 / +300 / +500 | T03, T10 / US 3, 10 |
| `stores/useThemeStore.ts` | Default `system`; a choice survives a new store instance (persisted) | T09 / US 9 |
| `components/*/index.test.tsx` | Each component's seam in the "TDD seams" table, checked through what the user sees (text, roles) and does (click, type) | T01–T10 |

## End-to-end (Playwright, `e2e/<ticket>-*.spec.ts`)

Each step below is written red-first in its ticket. Run together in this order, using the saved sign-in state, they form the flow in the spec "Testing Decisions":

1. A signed-out context opening `/today` lands on `/login`, which has only "Continue with Google" — T01 / US 1
2. Signed-in user with no profile lands on `/profile` — T01 / US 1
3. Invalid profile shows an error and is not saved; a valid profile shows the target; changing weight changes the target — T03 / US 3
4. Log a built-in dish: one row in today's list, eaten goes up, remaining goes down — T04 / US 4
5. Delete that row: totals return to the previous values — T05 / US 5
6. Create a custom food, log it, see it in today's list and in the saved custom foods on Add food — T06 / US 6
7. Log dishes until over target: remaining is negative, the warning shows, one more dish can still be logged — T07 / US 7
8. Open a sample plan day: three different meals with calories and the day's total vs target; today's list has not changed — T08 / US 8
9. The Today screen shows the water target for the saved weight and activity level; after changing either in Profile, it changes — T10 / US 10
10. Switch to dark, reload: still dark, no light flash (checked by reading `data-theme` right after navigation); today's entries are still there — T09 / US 9, T04 / US 4
11. Sign out from the header: Login screen shows, `/today` redirects to `/login` — T02 / US 2

## Data isolation (T05 "cannot delete another user's entry", spec "Further Notes")

- An SQL check run against the Supabase project with two users: user B's `select` and `delete` on user A's `meal_entries` and `custom_foods` return zero rows; an `insert` with A's `user_id` as B is refused.
- The app-level guard (every query in `src/utils/supabase/queries/` filters by `user_id`, every action calls `requireUser()`) is checked by `rls-auditor` in `/do-task` for 00b, T01, T03, T04, T05 and T06. It is not unit tested, because the actions need a live Supabase session.

## Manual demo (the "Demo" line in each ticket)

Each ticket's demo line (00a, 00b, T01–T10) is run once in the browser at phone width (375 px) and desktop width, in both light and dark themes, before the ticket status is set to `done`.

## What this proof does not cover

- Google's own sign-in screen (not automatable, per the spec).
- Correctness of the source food values (R3) — only that they match `food-list.md`.
- End-to-end tests in CI (out of scope in the spec). CI runs only lint, typecheck, unit tests and build.
