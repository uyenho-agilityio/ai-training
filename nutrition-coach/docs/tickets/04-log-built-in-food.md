# 04: Log a built-in food and see what is left

**Issue:** #12

**Spec:** `docs/spec/spec.md` · **User story:** 4

**What to build:** The user logs one of the 20 built-in dishes for today. The Today screen shows the target, the amount eaten and the amount left, and the list of today's foods.

**Blocked by:** 03

**Status:** todo

- [ ] The 20 built-in dishes are available as one fixed list, from `docs/requirements/food-list.md`
- [ ] Canh bí đao nấu sườn lợn is not in the list
- [ ] Thịt gà luộc carb = 0 and Gà xào sả carb = 4 are flagged as estimates
- [ ] Logging a dish adds one entry for today, with its name and values copied at logging time
- [ ] Target, eaten and remaining update right after logging
- [ ] Only the signed-in user's entries are shown
- [ ] The day is computed in Asia/Ho_Chi_Minh time, so an entry logged just after midnight in Vietnam counts toward the new day
- [ ] Demo: log a dish, see remaining go down
