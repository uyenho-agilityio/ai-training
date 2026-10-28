# Nutrition Coach

A web app for fat loss nutrition planning. The user enters personal details, gets a daily calorie and macro target, logs the foods eaten during the day, and sees what is left.

The UX/UI follows the Mijo App: modern, smooth, minimal and refined. The app has light and dark themes.

## Features

- Calculate a daily calorie and macro target for fat loss from personal details.
- Log foods eaten today, and see the target, eaten amount and remaining amount.
- Create custom foods for dishes that are not in the built-in list.
- Show a sample 7-day meal plan as a suggestion.
- Sign in with Google. Data is stored per user on the server.

## Tech stack

- Next.js 16 (App Router, TypeScript)
- Supabase Auth (Google sign-in) and PostgreSQL with Row Level Security
- Zustand for client state
- Vercel for hosting
- Vitest for unit tests, Playwright for end-to-end tests

## Project status

The project is in the planning stage.

- Intent: `docs/intent/intent.md`
- Requirements: `docs/requirements/`
- Design: `docs/design/`
- Spec: `docs/spec/spec.md`

The application code is not written yet.
