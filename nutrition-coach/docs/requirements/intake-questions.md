# Intake Questions

Questions raised by the BA from the client brief. Each question has a status:
- `answered`: the team has an answer.
- `confirmed-by-client`: the client has agreed to the answer.
- `open`: no answer yet.

Tickets (`tickets.md`) must not be handed to dev while any question they depend on is `open`.

---

### Q01 - Calorie formula for Vietnamese users
- Source: team-decisions.md, "Calorie formula"
- Question: Which formula should calculate BMR for Vietnamese users?
- Options: A) Mifflin-St Jeor  B) Katch-McArdle (needs body fat %)
- Recommended: A by default, B when the user enters body fat %.
- Status: answered (team), needs client confirmation

### Q02 - Deficit size
- Source: team-decisions.md, "Deficit"
- Question: Is a 500 kcal daily deficit below TDEE the right rate for fast fat loss?
- Options: A) 500 kcal (about 0.5 kg per week)  B) Another value
- Recommended: A.
- Status: answered (team), needs client confirmation

### Q03 - Macro split
- Source: team-decisions.md, "Macros"
- Question: Do the protein, fat and carbohydrate targets match the client's goal?
- Options: A) Protein 2 g/kg, fat 25% of calories, carbohydrate for the rest  B) Another split
- Recommended: A.
- Status: answered (team), needs client confirmation

### Q04 - Login method
- Source: client-brief.md, "Login is required"
- Question: Is Google sign-in through Supabase Auth acceptable, with no sign-up form and no email and password?
- Options: A) Google sign-in only  B) Email and password  C) Email with magic link
- Recommended: A, the simplest option.
- Status: answered (team, 2026-10-28, stage 2 design), needs client confirmation

### Q05 - Database and hosting
- Source: team-decisions.md, "Database" and "Frontend hosting"
- Question: Is Supabase PostgreSQL for data and Vercel for the frontend acceptable? SQLite is not used because Vercel does not keep local files between requests.
- Options: A) Supabase + Vercel  B) Another managed database + Vercel  C) Own server with SQLite
- Recommended: A.
- Status: answered (team), needs client confirmation

### Q06 - Food list source and license
- Source: food-list.md
- Question: Which source should the 20-dish food list come from, and is its license acceptable?
- Options: A) National Institute of Nutrition (NIN) data, with a cited source  B) Another public dataset  C) Hanoi Department of Health lookup site (suckhoethudo.vn)
- Recommended: A, with each value checked against the source before it goes into the constant.
- Source used: Hanoi Department of Health nutrition lookup, https://suckhoethudo.vn/tools/nutrition-dishes (accessed 28 Oct 2026). The site does not state its data origin and does not show license terms.
- Status: answered (team). The food list uses the dishes and values from this URL. The site does not show its data origin or license terms; this is recorded as a known limit.

### Q07 - Sample meal plan rule
- Source: team-decisions.md, "Sample 7-day meal plan"
- Question: Is a random pick from the food list, accepted when within ±10% of target and retried up to 5 times, acceptable?
- Options: A) This rule  B) Another rule
- Recommended: A.
- Status: answered (team), needs client confirmation

### Q08 - Custom foods in MVP
- Source: team-decisions.md, "Users can add their own foods"
- Question: Should users be able to add their own foods in the MVP?
- Options: A) Yes, through the add food form  B) No, only the built-in list
- Recommended: A, because a user needs a way to replace a dish that is not in the list.
- Status: answered (team), needs client confirmation

### Q09 - Water target
- Source: team-decisions.md, "Daily water target"
- Question: Is the water target body weight × 35 ml plus 500 ml per hour of exercise on that day correct? Exercise is entered as minutes per day on the Today screen.
- Options: A) This rule  B) Another rule
- Recommended: A.
- Status: answered (team), needs client confirmation

### Q10 - Over-target behaviour
- Source: team-decisions.md, "Over target"
- Question: When a user logs more than the target, should the app block the entry or show a warning?
- Options: A) Show a negative remaining value with a soft warning  B) Block the entry
- Recommended: A.
- Status: answered (client brief says so), needs client confirmation

### Q11 - Screens in MVP
- Source: team-decisions.md, "MVP screens"
- Question: Are the four MVP screens (sign up and sign in, profile and goal, Today, add food) enough?
- Options: A) These four  B) Add meal history
- Recommended: A.
- Status: answered (team), needs client confirmation

### Q12 - Out of scope
- Source: team-decisions.md, "Out of scope for MVP"
- Question: Are AI-generated plans, supplement advice, meal history and water tracking out of scope for the MVP?
- Options: A) Yes, all out  B) Keep one of them
- Recommended: A.
- Status: answered (team), needs client confirmation

### Q13 - Portion scaling and units in the daily total
- Source: food-list.md, "Serving weight"
- Question: Should the app scale portions by weight (grams), or treat each dish as one fixed serving and add up its kcal and macros?
- Options: A) Fixed serving, add up kcal and macros  B) Scale by grams
- Recommended: A for the MVP. The daily total is kcal and macros, not kilograms.
- Status: answered (team). Option A chosen for the MVP. Option B to be considered later.
