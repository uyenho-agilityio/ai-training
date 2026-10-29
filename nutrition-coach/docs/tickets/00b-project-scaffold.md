# 00b: Project scaffold

**Issue:** #8

**Spec:** `docs/spec/spec.md` · **Plan:** `docs/plan/plan.md` step 2, details in `docs/plan/code-structure.md` · **User story:** none (setup)

**What to build:** An empty Next.js app with the agreed stack, the test setup, and the database schema with Row Level Security, so feature tickets can start. This is the first ticket run with `/do-task`.

**Blocked by:** 00a

**Status:** done

- [x] Next.js 16.4.3 with the App Router and strict TypeScript; the version is checked on npm first
- [x] Tailwind CSS 4 (latest, checked on npm) with `@tailwindcss/postcss`; `src/theme/` holds the colors, font, radius, shadows and breakpoints from `docs/design/ui_ux_branding.md`, and `globals.css` holds only the shared base
- [x] `src/` has `app`, `components`, `constants`, `hooks`, `icons`, `schemas`, `stores`, `theme`, `types`, `utils`, each with an `index.ts` where it exports code; each component is a folder with `index.tsx` and `index.test.tsx`; there is no `src/lib/`
- [x] Scripts `dev`, `build`, `lint`, `typecheck`, `test`, `e2e` work on the empty app
- [x] Vitest is set up with Testing Library and `jsdom`; it finds `src/**/__tests__/*.test.ts(x)` and `src/components/**/index.test.tsx`
- [x] Playwright is set up, with a `setup` project that saves the sign-in state to `playwright/.auth/`
- [x] One sample unit test, one sample component test and one sample e2e test run green
- [x] `.gitignore` covers `.env*.local`, `playwright/.auth/`, `.next/`, `node_modules/`, test reports and `.claude/settings.local.json`
- [x] `.env.example` lists the variable names only, with no values
- [x] `supabase/migrations/0001_init.sql` creates `profiles`, `custom_foods` and `meal_entries` as in `docs/design/database_schema.md`, with RLS enabled and policies on `user_id = auth.uid()`
- [x] `rls-auditor` reports no gaps in the migration
- [x] `CLAUDE.md` is updated after running `/init` on the scaffold
- [ ] Demo: open the PR made by `/do-task`, see base `feat/nutrition-coach` and CI passing
