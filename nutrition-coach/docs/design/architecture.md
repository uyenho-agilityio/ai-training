# 02 Architecture

Status: agreed in stage 2 design session, 2026-10-28.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.4.3 (latest stable on npm), App Router | Client requirement: Next.js |
| Language | TypeScript | |
| Auth | Supabase Auth, Google sign-in only | No email and password, no sign-up form |
| Database | Supabase PostgreSQL with Row Level Security | Data stored per user on the server |
| Client state | Zustand, global store | Used for UI state and the theme preference only |
| Validation | Zod, on the server | Checks input before any write |
| Hosting | Vercel for the frontend, Supabase for data | |
| Unit tests | Vitest | Calorie formula, macro split, remaining calculation |
| End-to-end tests | Playwright | Login, add food, log, delete, remaining |

## Data flow

- **Reads** use Server Components. The page loads the current user's profile, today's entries and custom foods on the server.
- **Writes** use Server Actions: save profile, add custom food, log a food, delete a logged food.
- There are no separate API routes for the app.
- Each Server Action re-checks the signed-in user before writing. RLS is the second guard.
- Client components only hold UI state in Zustand. User data is not stored in Zustand, localStorage or cookies.

## Auth flow

1. User clicks "Continue with Google" on the Login screen.
2. Supabase Auth runs Google OAuth. The first successful login creates the user in Supabase.
3. The app reads the session on the server. If there is no session, it redirects to Login.
4. If the user has no profile row, the app redirects to Profile. Otherwise it goes to Today.

## Calculation

- BMR: Mifflin-St Jeor by default. Katch-McArdle when body fat % is entered.
- TDEE: BMR multiplied by the activity factor. Factors: 1.2, 1.375, 1.55, 1.725, 1.9.
- Target calories: TDEE minus 500 kcal.
- Protein: 2 g per kg of body weight. Fat: 25% of target calories. Carbohydrate: the rest.
- Results are rounded to whole kcal and whole grams.
- Targets are computed from the profile each time they are shown. They are not saved per day, because the MVP has no meal history by day.

## Food data

- The 20 built-in dishes are a TypeScript constant in the code. They are not stored in the database.
- Duplicate entries for the same dish must be resolved before the constant is built. See `docs/requirements/food-list.md`.
- Custom foods are stored in `custom_foods` (see `03_database_schema.md`).
- Each logged entry stores its calories and macros at the time of logging.

## Configuration

- Secrets (Supabase URL and keys, Google OAuth secret) are set as environment variables. They are never committed to the repository.
- The Google OAuth client and the Supabase project are created and owned by the product team.

## Theme

- Theme is a Zustand store with the `persist` middleware, stored under its own localStorage key.
- An inline script in `<head>` applies the stored theme before first paint.
- See `01_ui_ux_branding.md` for the theme behavior.
