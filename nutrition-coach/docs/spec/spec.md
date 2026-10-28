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

### Account and access
1. As a new user, I want to sign in with my Google account, so that I do not have to create a password.
2. As a new user, I want my first sign-in to take me to the profile screen, so that I can enter my details before anything else.
3. As a returning user, I want to go straight to the Today screen after sign-in, so that I can start logging food quickly.
4. As a signed-in user, I want to sign out, so that I can leave the app on a shared device.
5. As a visitor who is not signed in, I want to be sent to the login screen if I open a private page, so that my data is never shown to someone else.

### Profile and target
6. As a user, I want to enter my sex, age, height in cm, weight in kg and activity level, so that the app can calculate my target.
7. As a user, I want to optionally enter my body fat percentage, so that the app uses a more accurate formula.
8. As a user, I want to see my daily calorie target and my protein, carb and fat targets after I save my profile, so that I know what to aim for.
9. As a user, I want the calculated target to update when I change my profile, so that the numbers always match my current details.
10. As a user, I want to see a clear message when an input is missing or invalid, so that I can fix it before saving.
11. As a user, I want the target to be shown as whole numbers, so that it is easy to read.

### Logging food
12. As a user, I want to choose one of the 20 built-in dishes and log it for today, so that I can record what I ate quickly.
13. As a user, I want to create a custom food with a name, calories, protein, carbs and fat for one serving, so that I can log a dish that is not in the list.
14. As a user, I want my custom foods saved to my account, so that I can log them again later without typing them again.
15. As a user, I want to see the list of foods I logged today, so that I can check what I have eaten.
16. As a user, I want to delete a food I logged by mistake, so that my totals stay correct.
17. As a user, I want the remaining calories and macros to update right after I log or delete a food, so that I always see the current numbers.

### Today screen
18. As a user, I want to see my target, eaten amount and remaining amount for calories and macros at the top of the Today screen, so that I can see my progress at a glance.
19. As a user, I want to see a negative remaining value and a soft warning when I go over my target, so that I know I am over without being blocked from logging.
20. As a user, I want the day to follow Vietnam time (Asia/Ho_Chi_Minh), so that my day resets at midnight in Vietnam.

### Sample meal plan
21. As a user, I want to see a sample 7-day meal plan on the Today screen, so that I can get ideas for what I can still eat.
22. As a user, I want each day in the sample plan to show breakfast, lunch and dinner from the built-in dishes, so that I can see a full day of meals.
23. As a user, I want the sample plan days to be close to my calorie target, so that the plan is useful.
24. As a user, I want the sample plan to be a suggestion only, so that nothing is logged to my day unless I choose it.

### Theme and appearance
25. As a user, I want to switch between light, dark and system themes, so that the app is comfortable to use in any light.
26. As a user, I want the app to remember my theme choice on this device, so that I do not have to switch it every time.
27. As a user, I want both themes to be easy to read, so that the numbers are clear in either mode.
28. As a user, I want the app to work well on a phone-sized screen, so that I can log food on my phone.

### Privacy
29. As a user, I want my profile, custom foods and logged foods to be visible only to me, so that my data stays private.

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

- Targets and plans are computed when shown. Nothing is saved per day.
- The food list has duplicate entries for some dishes. They must be resolved before the food catalog is built (see `docs/requirements/food-list.md`).
- Several decisions still need client confirmation (see `docs/requirements/intake-questions.md`). Work that depends on them should be held back until they are confirmed.
- The Google OAuth client and the Supabase project are created and owned by the product team. Secrets are set as environment variables and never committed.
- Issue tracker: GitHub Issues, in the GitHub repository of the `nutrition-coach` folder. The repository is not connected yet. Once it is connected, each user story becomes one issue, with its number from this spec at the top.
- Ticket status uses three states: `todo`, `in progress`, `done`.
- This spec is not yet published as issues. Publishing waits until the repository is connected.
