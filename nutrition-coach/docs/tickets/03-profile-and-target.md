# 03: Profile and daily target

**Issue:** #11

**Spec:** `docs/spec/spec.md` · **User story:** 3

**What to build:** The user enters personal details and sees the daily calorie and macro target. Changing the details updates the target.

**Blocked by:** 01

**Status:** in progress

- [x] The form has sex, age, height (cm), weight (kg), activity level, and optional body fat %
- [x] Invalid or missing inputs show a clear message and are not saved
- [x] Mifflin-St Jeor is used by default; Katch-McArdle is used when body fat % is set
- [x] Target = TDEE minus 500 kcal; protein 2 g per kg; fat 25% of calories; carbs for the rest
- [x] Values are shown as whole numbers
- [ ] Demo: save a profile, see the target, change weight, see the target update
