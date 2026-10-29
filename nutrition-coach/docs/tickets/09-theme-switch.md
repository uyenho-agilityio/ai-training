# 09: Light, dark and system theme

**Issue:** #17

**Spec:** `docs/spec/spec.md` · **User story:** 9

**What to build:** A theme switch in the header lets the user choose light, dark or system. The choice is remembered on this device.

**Blocked by:** 01

**Status:** todo

- [ ] The header has a switch with light, dark and system options; system is the default
- [ ] Light theme uses the agreed palette from `docs/design/ui_ux_branding.md`
- [ ] Dark theme uses the proposed dark palette from `docs/design/ui_ux_branding.md`
- [ ] Dark values are added to the Tailwind theme in `src/theme/` (set up in 00b), and `dark:` styles follow the switch, not only the OS setting
- [ ] The choice is kept after reload, using a Zustand store with persist
- [ ] No flash of the wrong theme on first paint
- [ ] Demo: switch themes, reload, the choice stays
