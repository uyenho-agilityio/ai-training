# 09: Light, dark and system theme

**Issue:** #17

**Spec:** `docs/spec/spec.md` · **User story:** 9

**What to build:** A theme switch in the header lets the user choose light or dark. Until the user picks one, the theme follows the device setting. The choice is remembered on this device.

**Blocked by:** 01

**Status:** done

- [x] The header has a switch with light and dark options; without a choice, the theme follows the device setting
- [x] Light theme uses the agreed palette from `docs/design/ui_ux_branding.md`
- [x] Dark theme uses the proposed dark palette from `docs/design/ui_ux_branding.md`
- [x] Dark values are added to the Tailwind theme in `src/theme/` (set up in 00b), and `dark:` styles follow the switch, not only the OS setting
- [x] The choice is kept after reload, using a Zustand store with persist
- [x] No flash of the wrong theme on first paint
- [x] Demo: switch themes, reload, the choice stays
