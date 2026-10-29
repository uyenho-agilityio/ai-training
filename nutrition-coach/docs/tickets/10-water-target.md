# 10: Daily water target

**Spec:** `docs/spec/spec.md` · **User story:** 10 (to be added to the spec in 00a)

**What to build:** The Today screen shows a daily water target: body weight (kg) × 35 ml, plus an add-on by the profile's activity level. There is no water intake tracking and no daily exercise input.

**Blocked by:** 03 (the UI part also waits for 08's change to the Today screen)

**Status:** todo

- [ ] Add-ons by activity level (plan decision D3): sedentary and light +0 ml, moderate +300 ml, active and very active +500 ml
- [ ] Water target = weight (kg) × 35 ml + add-on, in whole ml
- [ ] 35 ml per kg and the add-ons live in one place, with the other nutrition rules
- [ ] The Today screen shows the water target in ml for the signed-in user's activity level
- [ ] Changing the weight or the activity level in Profile changes the water target
- [ ] No water intake is logged or stored
- [ ] Demo: save 70 kg with moderate activity, see 2,750 ml; change to active, see 2,950 ml
