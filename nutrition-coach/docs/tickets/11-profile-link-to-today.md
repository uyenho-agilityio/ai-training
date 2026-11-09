# 11: Way back to Today from Profile

**Issue:** #43

**Spec:** `docs/spec/spec.md` · **User story:** 1 · **Design:** `docs/design/ui_ux_branding.md` ("Navigation")

**What to build:** A signed-in user who already has a profile can go from Profile back to Today with one click. Today to Profile already works through the header link. Today's header shows "Profile", but Profile's header shows no link back to Today, so the user has to type the address. A user with no profile never sees Today (Today sends them to Profile), so the link is shown only when a profile exists.

**Bug seen:** A user with a profile signs in, lands on Today, clicks Profile, and then has no link back to Today. The cause is in `src/components/ProfileLink/index.tsx`, which shows the link only on `/today` and hides it on `/profile`.

**Blocked by:** 03

**Status:** done

- [x] A user with a profile sees a "Today" link in the header nav on the Profile page, next to the app name; it goes to `/today`
- [x] A user without a profile does not see the "Today" link in the header nav
- [x] The header nav shows "Profile" on the Today page, next to the app name; the link to the page you are on is hidden
- [x] `docs/design/ui_ux_branding.md` ("Navigation") describes the header nav, updated in the same PR
- [x] Demo: sign in with a profile, land on Today, click Profile, then click Today and land on Today again

## Log

- 2026-11-09 start: issue #43 labelled `status: in progress`; branch `feat/nc-11-profile-link-to-today` from `github/feat/nutrition-coach` in the main checkout, no worktree (ticket 03 done)
- 2026-11-09 gate1: plan approved. Seams: unit `TodayLink`; flow e2e `e2e/13-profile-to-today.spec.ts`; design doc Navigation line
- 2026-11-09 slice 1: TodayLink test red, then component green, 1 test pass
- 2026-11-09 slice 2: Profile shows Today link when profile exists; e2e 13 red then green; ProfileLink test renamed
- 2026-11-09 checks: lint, typecheck, unit tests (135 pass), build, e2e chromium (13 green)
- 2026-11-09 review: manual read of the diff, no findings to fix. /code-review, /security-review and spec-checker not run
- 2026-11-09 slice 3: e2e 11-no-profile adds no-link check on Profile without a profile; guard test, passes on the fix (also passes before it); no-profile project 2 tests green
- 2026-11-09 slice 4: header nav next to the app name (Today when profile exists, Profile); ProfileLink and TodayLink removed; layout passes hasProfile; do-task usage line drops docs/tickets/ prefix
- 2026-11-09 checks: unit 137 pass, lint, typecheck, build, full e2e 17 pass
- 2026-11-09 slice 5: nav hides the link to the page you are on (Profile on /profile, Today on /today); tests first, then component
- 2026-11-09 checks: unit 137 pass, lint, typecheck, build, full e2e 17 pass (after stopping the dev server on port 3000)
- 2026-11-09 slice 5b: nav links use the text colour token (no 70% opacity), per review of the screenshot
- 2026-11-09 gate2: approved. Commits: test (e2e 11 and 13), feat (header nav), docs (design doc and ticket status)
- 2026-11-09 pr: PR #44 opened into feat/nutrition-coach (Closes #43), issue labelled status: in review
