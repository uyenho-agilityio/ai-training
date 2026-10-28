# 01 UI/UX and branding

Status: agreed in stage 2 design session, 2026-10-28. Reference: Mijo App (https://mijo-te.vercel.app/), used for layout feel only.

## Visual direction

- Look and feel follows Mijo App: modern, smooth, minimal, refined.
- Primary color is a deeper, more vivid green than Mijo, to fit a food app.
- The app has a light theme and a dark theme. The user switches between them in the app.

## Color tokens

Light theme (matches the agreed palette):

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#15803D` | Primary buttons, active states, remaining-calorie accent |
| `--color-background` | `#F6FAF7` | Page background |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-text` | `#1F2A22` | Body text |
| `--color-warning` | `#D97706` | Over-target warning |

Dark theme (proposed by the team, to be reviewed):

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#34D399` | Primary buttons and accents, lighter for contrast on dark |
| `--color-background` | `#0F1A14` | Page background |
| `--color-surface` | `#17241D` | Cards |
| `--color-text` | `#E6F2EA` | Body text |
| `--color-warning` | `#FBBF24` | Over-target warning |
| Text on primary | `#0F1A14` | Label on primary buttons |

## Typography

- Font: Be Vietnam Pro. It supports Vietnamese diacritics well.

## Theme switch

- Three options: light, dark, and system. The default is system.
- The choice is stored in localStorage through a Zustand store with the `persist` middleware. It is a device preference, not user data.
- A small inline script in `<head>` reads the stored value and sets `data-theme` before first paint, so the page does not flash the wrong theme.
- Colors are CSS variables, so switching theme does not reload the page.

## Screens (MVP)

1. **Login**: one button, "Continue with Google". No sign-up form and no password field.
2. **Profile and goal**: sex, age, height (cm), weight (kg), activity level (five options), optional body fat %. Shows the calculated calorie and macro target after save. Shown first after the first login.
3. **Today**: the main screen.
   - Top: three cards for target, eaten and remaining. Each card shows calories and the three macros (protein, carbs, fat).
   - Middle: list of meals logged today by the current user. Each row can be deleted.
   - Bottom: an "Add food" button.
   - Over target: the remaining value turns negative and a soft amber warning appears. Logging is not blocked.
   - Below the list: a "Sample meal plan" block with seven days to choose from. Each day shows breakfast, lunch and dinner picked from the 20 built-in dishes. The plan is a suggestion and is never logged automatically.
4. **Add food**: choose a built-in dish, or create a custom food with name, calories, protein, carbs and fat for one serving. The user then logs it to today.

## Navigation

- First login goes to Profile if no profile exists yet. Later logins go to Today.
- Theme switch is available from every screen, in the header.
