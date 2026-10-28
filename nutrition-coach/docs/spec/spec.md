# Spec: Nutrition Coach (MVP)

- Status: draft, pending product owner review
- Date: 2026-10-28
- Source intent: `docs/intent/intent.md`
- Design files: `docs/design/01_ui_ux_branding.md`, `docs/design/02_architecture.md`, `docs/design/03_database_schema.md`
- Requirement inputs: `docs/requirements/client-brief.md`, `docs/requirements/team-decisions.md`, `docs/requirements/food-list.md`, `docs/requirements/intake-questions.md`

## Problem Statement

A user who wants to lose fat does not know how many calories and macros they need each day. They also have no simple way to see how much of the day's target is left after each meal.

## Solution

A web app called Nutrition Coach. The user signs in with Google and enters a few personal details. The app shows a daily calorie and macro target for fat loss. On the Today screen, the user logs the foods they eat, and the app shows what is left for the day. The app also shows a sample 7-day meal plan as a suggestion. The user can switch between light, dark and system themes.

## User Stories

Each user story maps to one ticket with the same number in `docs/tickets/`.

### Account
1. As a user, I want to sign in with my Google account, so that I do not need a password, and go to Profile on my first sign-in or to Today after that.
2. As a signed-in user, I want to sign out, so that I can leave the app on a shared device.

### Profile and target
3. As a user, I want to enter my personal details, see my daily calorie and macro target, and see it update when I change my details, so that the target always matches my current details.

### Logging food
4. As a user, I want to log a built-in dish for today and see it in today's list, with my target, eaten amount and remaining amount, so that I can see what is left for the day. The day follows Vietnam time (Asia/Ho_Chi_Minh), so it resets at midnight in Vietnam.
5. As a user, I want to delete a food I logged by mistake, so that my totals stay correct.
6. As a user, I want to create my own food and log it, and have it saved for later use, so that I can log a dish that is not in the built-in list.
7. As a user, I want to see a negative remaining value with a soft warning when I go over my target, so that I know I am over without being blocked from logging.

### Sample meal plan
8. As a user, I want to see a sample 7-day meal plan on the Today screen, with breakfast, lunch and dinner close to my calorie target, so that I get ideas for the rest of the day. The plan is a suggestion only and never logs anything.

### Theme
9. As a user, I want to switch between light, dark and system themes, and have my choice remembered on this device, so that the app is comfortable to use.

## Implementation Decisions

### Modules to build
- **Target calculator** (pure): takes a profile and returns the daily calorie target and the protein, carb and fat targets. Uses Mifflin-St Jeor by default and Katch-McArdle when body fat % is set. Applies the activity factor, the 500 kcal deficit, protein at 2 g per kg, fat at 25% of calories, and carbs for the rest. Results are rounded to whole numbers.
- **Daily totals** (pure): takes the target and a list of logged entries for one day, and returns eaten totals and remaining totals for calories and macros. Remaining can be negative.
- **Food catalog** (constant): the 20 built-in dishes, each with a code, name in Vietnamese and English, meal type, and calories and macros for one serving. Duplicate entries are resolved before the constant is built.
- **Sample plan generator** (pure): takes the catalog and a calorie target, and returns seven days of breakfast, lunch and dinner. The random source is passed in, so the result can be tested. Each day is accepted when its calories are within ±10% of the target. Otherwise the day is picked again, up to 5 tries, and the closest result is kept.
- **Profile, custom food and meal log data access** (server side): reads and writes the three tables, always scoped to the signed-in user.
- **Session guard** (server side): checks that the user is signed in before any page or write.
- **Theme store** (client): a Zustand store with a persist middleware. Holds the theme choice (light, dark or system) under its own localStorage key.
- **Theme script** (client, in the page head): applies the stored theme before the first paint.

### Interfaces
- `calculateTargets(profile) -> { kcal, proteinG, carbG, fatG }`
- `calculateDailyTotals(target, entries) -> { eaten, remaining }`, where each value has kcal, protein, carb and fat.
- `generateSamplePlan(catalog, kcalTarget, random) -> Day[7]`, where each Day has breakfast, lunch and dinner.

### Server actions (writes)
- `saveProfile(input)`: validates the input with Zod, then inserts or updates the user's profile row.
- `addCustomFood(input)`: validates the input, then inserts a custom food for the user.
- `logFood(source, date)`: source is either a built-in food code or a custom food id. The action copies the name and values into a new meal entry for the given date.
- `deleteMealEntry(id)`: deletes the user's own entry.

Each action re-checks the signed-in user. RLS is the second check.

### Schema changes
- New tables: `profiles`, `custom_foods`, `meal_entries`, as described in `docs/design/03_database_schema.md`.
- Row Level Security is enabled on all three tables. Each policy allows access only when `user_id` matches the signed-in user.
- Meal entries copy the food values at logging time. Changing a food later does not change past entries.

### Architectural decisions
- Next.js 16.4.3 with the App Router and TypeScript.
- Supabase Auth with Google sign-in only. There is no sign-up form and no email and password.
- Supabase PostgreSQL for data. Vercel for hosting the frontend.
- Server Components read data. Server Actions write data. No separate API routes.
- Zustand holds only UI state and the theme preference. User data is not kept in local storage.
- Targets are calculated from the profile when shown. They are not saved per day.

### Technical clarifications
- Dates use Asia/Ho_Chi_Minh.
- Weight is in kg, height in cm.
- Activity factors: 1.2, 1.375, 1.55, 1.725, 1.9 for the five activity levels.

## Testing Decisions

### What makes a good test
- Tests check behavior from the outside: given inputs, the expected outputs or what the user sees.
- Tests do not check internal function calls or the order of internal steps.

### Modules to test
- **Target calculator** (unit, Vitest): known inputs for both formulas, the activity factors, the deficit, the macro split and rounding. Includes a case with body fat % and a case without.
- **Daily totals** (unit, Vitest): empty day, one entry, several entries, and a day over target that gives a negative remaining value.
- **Sample plan generator** (unit, Vitest): with a fixed random source, every day stays within ±10% of target, or the closest result is kept after 5 tries. Each day has three meals.
- **Full user flow** (end-to-end, Playwright): sign-in, save profile, see target, log a built-in dish, create and log a custom food, delete an entry, see remaining update, switch theme, reload and confirm the theme and the day's entries are kept.

### Prior art
- The `claude-training` folder uses the Node test runner. This project uses Vitest and Playwright, as decided in `docs/design/02_architecture.md`. No existing test in `nutrition-coach` yet.

### Google sign-in in end-to-end tests
- Google blocks automated browsers on its sign-in screen. The tests do not automate that screen. They check what the app does after sign-in.
- Decided: a tester signs in with a test Google account once, in a browser that Playwright opens. Playwright saves the signed-in state to a file. Later tests reuse that file and do not sign in again.
- The saved state file is never committed to git.
- Later, for unattended runs in CI, a test user in Supabase and a service role key in CI secrets will be used. The service role key is never placed in code or in the browser. Not needed for the first version.

## Out of Scope

- AI-generated meal plans, snack swaps, personal rules and supplement advice.
- Meal history by day.
- Water intake tracking. Only the water target is shown.
- Any paid API.
- Email and password sign-in, magic link, and other sign-in methods.
- Portion scaling by grams. Each food is one fixed serving.
- Blocking entries when the target is exceeded.

## Further Notes

- Applies to all stories: each user sees only their own data (Row Level Security). Both themes are readable, and the layout works at phone width.
- Targets and plans are computed when shown. Nothing is saved per day.
- The food list has duplicate entries for some dishes. They must be resolved before the food catalog is built (see `docs/requirements/food-list.md`).
- Several decisions still need client confirmation (see `docs/requirements/intake-questions.md`). Work that depends on them should be held back until they are confirmed.
- The Google OAuth client and the Supabase project are created and owned by the product team. Secrets are set as environment variables and never committed.
- Issue tracker: GitHub Issues, in the GitHub repository of the `nutrition-coach` folder. The repository is not connected yet. Once it is connected, each user story becomes one issue, with its number from this spec at the top.
- Ticket status uses three states: `todo`, `in progress`, `done`.
- This spec is not yet published as issues. Publishing waits until the repository is connected.
