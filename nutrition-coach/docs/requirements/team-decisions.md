# Team Decisions: Nutrition Coach

Decisions made by the team, moved out of `client-brief.md` so the brief holds only the client's request. Each question in `intake-questions.md` points to a section here.

## Team decisions (from the grilling session)

- Target users are Vietnamese. Weight is in kg and height in cm. All dates and times use Asia/Ho_Chi_Minh.
- Calorie formula: Mifflin-St Jeor by default. Katch-McArdle when the user enters body fat %.
- Deficit: 500 kcal below TDEE per day.
- Macros: protein 2 g per kg of body weight, fat 25% of calories, carbohydrate for the rest.
- Authentication: Google sign-in only, through Supabase Auth. No sign-up form and no email and password.
- Database: Supabase PostgreSQL. Each user's rows are protected by Row Level Security.
- Frontend hosting: Vercel.
- Sample 7-day meal plan: each day picks breakfast, lunch and dinner at random from the food list. A day is accepted when its calories are within ±10% of target; otherwise it re-picks, up to 5 tries, and keeps the closest result. No dish is repeated within one day. Each plan day shows its total next to the target. No snacks (D1).
- Sample 7-day meal plan on the Today screen: the plan is shown as a suggestion for what the user can still eat that day, based on the remaining calories and macros after logging.
- The food log and the sample plan are connected: after a meal is logged, the remaining target and the suggestions update to match.
- Users can add their own foods. Custom foods are stored in the user's own rows.
- Daily water target: body weight (kg) × 35 ml, plus 0 ml for sedentary and light, 300 ml for moderate, or 500 ml for active and very active (D3). The per-hour exercise add-on is dropped, because exercise minutes are not stored per day.
- Over target: the app shows a negative remaining value with a soft warning and does not block logging.
- Styling: Tailwind CSS 4 (D4).
- Sign-in callback: one route file for the Google callback, the only exception to "no separate API routes" (D2).
- Tests: every folder with code is unit tested with Vitest; Playwright tests the whole user flow; TDD seams per ticket are in `docs/plan/test-strategy.md` (D5, D7).
- Folder layout: no `src/lib/`; one folder per kind of code; each component in its own folder (D6).

## MVP screens

1. Sign up and sign in.
2. Profile and goal.
3. Today (target, eaten, remaining, meal list).
4. Add food.

## Out of scope for MVP

- AI-generated meal plans, snack swaps, personal rules and supplement advice.
- Meal history by day.
- Water intake tracking (only the target is shown).
- Any paid API.

## Sources

- Calorie formulas: Mifflin-St Jeor (1990) and Katch-McArdle, as used in standard references.
