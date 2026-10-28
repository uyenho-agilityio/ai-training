# Intent: Nutrition Coach

- Author: Uyen Ho
- Date: 2026-10-28
- Status: draft, awaiting product owner review
- Sources: `docs/requirements/client-brief.md`, `docs/requirements/team-decisions.md`, `docs/requirements/intake-questions.md`

## Problem

A user who wants to lose fat does not know how many calories and macros they need each day. They also have no simple way to see how much of the day's target is left after each meal.

## Proposed outcome

A web app named Nutrition Coach. Its look and feel follow the Mijo App: modern, smooth, minimal and refined.

- The user enters personal information and gets a daily calorie and macro target for fat loss.
- The user logs the meals eaten during the day. The app subtracts them from the target, so the user sees what is left.
- A sample 7-day meal plan is shown on the Today screen as a suggestion for what the user can still eat that day.

## Affected users and systems

- Users: Vietnamese users who want to lose fat.
- Systems: a Next.js web app with login. User data is stored per user on the server, not in local storage.

## Constraints

From the client:
- Next.js.
- Login is required, and user data is stored per user on the server.
- The UX/UI follows the Mijo App.

From the team (`docs/requirements/team-decisions.md`):
- Weight in kg, height in cm, and dates in Asia/Ho_Chi_Minh.
- Calorie formula: Mifflin-St Jeor by default, Katch-McArdle when body fat % is entered.
- Deficit: 500 kcal below TDEE per day.
- Macros: protein 2 g per kg of body weight, fat 25% of calories, carbohydrate for the rest.
- Each food is one fixed serving, so the app adds up kcal and macros without scaling by grams.
- Over target: the app shows a negative remaining value with a soft warning and does not block logging.

## Out of scope for MVP

- AI-generated meal plans, snack swaps, personal rules and supplement advice.
- Meal history by day.
- Water intake tracking. Only the water target is shown.
- Any paid API.

## Open questions

These come from `docs/requirements/intake-questions.md`. Each one needs an answer, or a decision to carry it forward, before the spec is accepted.

- Q01 Calorie formula: needs client confirmation.
- Q02 Deficit of 500 kcal: needs client confirmation.
- Q03 Macro split: needs client confirmation.
- Q06 Food list source and license: the source's license terms are unknown and recorded as a known limit.
- Q07 Sample meal plan rule: needs client confirmation.
- Q08 Custom foods in MVP: needs client confirmation.
- Q09 Water target: needs client confirmation.
- Q10 Over-target behaviour: needs client confirmation.
- Q11 Screens in MVP: needs client confirmation.
- Q12 Out of scope: needs client confirmation.
- Q13 Fixed serving for the daily total: answered by the team.
- Whether the sample meal plan is shown on the Today screen as a suggestion for what remains, and how it connects to the food log. The team decision is written in general terms and needs detail in the spec.
