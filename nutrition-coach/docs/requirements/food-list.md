# Food List (BA working file, internal)

Target: 20 dishes for the sample 7-day meal plan and for food logging. Used by dev to build the constant. Not shared with the client.

Status: 20 dishes, from https://suckhoethudo.vn/tools/nutrition-dishes, enough for the meal plan generator. Meal type confirmed by the team. Source decided by the team (Q06). The site does not show its data origin or license terms; this is a known limit.

## Source policy

- Values must come from one named source and be cited here.
- Each dish needs: name (EN and VN), serving weight in grams, meal type, kcal, protein g, fat g, carbohydrate g.
- Values are per the serving weight stated here, not per 100 g unless the source gives 100 g.
- Meal type is one or more of: breakfast, lunch, dinner, snack. The meal plan generator picks dishes by meal type.

## Dishes found so far

Source: Hanoi Department of Health nutrition lookup, https://suckhoethudo.vn/tools/nutrition-dishes (accessed 28 Oct 2026). The site does not state its data source and does not show license terms. Values are per one serving. Serving weight is not given.

| Code | Dish (VN) | Dish (EN) | Meal type (proposed) | kcal | Protein g | Fat g | Carb g | Serving weight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VPF-000008 | Cơm hến | Baby clam rice | lunch, dinner | 291 | 18 | 6.3 | 40.1 | not given |
| VPF-000009 | Cơm rang thập cẩm | Mixed fried rice | lunch, dinner | 623 | 19.9 | 21.9 | 86.6 | not given |
| VPF-000013 | Cơm sườn | Pork rib rice | lunch, dinner | 616 | 24.5 | 16.2 | 93 | not given |
| VPF-000243 | Cháo gà | Chicken congee | breakfast | 225 | 9.8 | 7.8 | 28.8 | not given |
| HAP-211087 | Phở bò chín | Noodle soup with brisket & meat balls | breakfast, lunch | 448.5 | 31.2 | 6.7 | 65.7 | not given |
| VPF-000214 | Bánh canh cá rô | Thick noodle soup with perch | lunch, dinner | 167 | 14.9 | 5.5 | 15.8 | not given |
| VPF-000018 | Canh bầu nấu tôm | Winter melon soup with shrimp | lunch, dinner | 88 | 5.4 | 5.4 | 4.6 | not given |
| VPF-000286 | Bánh bao chay | Vegetarian steamed bun | breakfast, snack | 33 | 0.9 | 0.1 | 7.1 | not given |
| VPF-000094 | Thịt gà luộc | Boiled chicken | lunch, dinner | 577 | 58.9 | 38 | not listed | not given |
| VPF-000072 | Đậu phụ luộc | Boiled tofu | lunch, dinner | 190 | 21.8 | 10.8 | 1.4 | not given |
| VPF-000179 | Rau muống xào | Stir-fried water spinach | lunch, dinner | 177 | 10.2 | 11.2 | 4.5 | not given |
| VPF-000211 | Nộm rau muống | Water spinach salad | lunch, dinner | 230 | 10.8 | 15.9 | 7.7 | not given |
| VPF-000127 | Khoai lang chiên | Fried sweet potato | snack | 574 | 4.7 | 25.2 | 82.8 | not given |
| VPF-000223 | Bún chả | Grilled pork with vermicelli | lunch | 518 | 25.8 | 11 | 90.3 | not given |
| VPF-000007 | Cơm nắm | Rice ball | breakfast, snack | 336 | 8.7 | 5.7 | 62.2 | not given |
| VPF-000215 | Bánh canh thịt gà | Thick noodle soup with chicken | breakfast, lunch | 337 | 12.5 | 11 | 46.8 | not given |
| VPF-000193 | Gà xào sả (Thịt gà xào sả) | Stir-fried chicken with lemongrass | lunch, dinner | 241 | 23.2 | 16.4 | 0 | not given |
| VPF-000401 | Chuối tiêu | Lady finger banana | snack | 92 | 1.4 | 0.2 | 21 | not given |
| HAN-112048 | Bánh mì thập cẩm | Mixed Vietnamese baguette | breakfast | 678.8 | 30.6 | 40.5 | 48.1 | not given |
| VPF-000386 | Sữa chua có đường Ba Vì | Ba Vi sweetened yogurt | breakfast, snack | 103 | 2.9 | 2.9 | 16.2 | not given |
| VPF-000019 | Canh bí đao nấu sườn lợn | Winter melon soup with pork ribs | dinner | 168 | conflict (see note) | conflict (see note) | 6.2 (unit wrong on site) | not given |

Notes:
- Thịt gà luộc has no carbohydrate value on the site.
- Several dishes have more than one entry with different kcal (for example Cháo gà: 225, 375.9, 371.4, 587.4). The entry used is the first one shown, with code VPF-000243 and the category "Bánh canh, bánh đa, bún, cháo...". Duplicates need to be resolved before the constant is built.
- Note on Canh bí đao nấu sườn lợn: the site's table lists protein as 168 g (that is the energy value), fat as 12.2 and lipid as 10.6, and carbohydrate in µg. Do not use this row until it is checked against the source.
- Gà xào sả has carbohydrate 0 on the site, which may be a real value or a missing one.
- Meal type is based on the dish, not from the source. The team confirmed it.

## Dropped

The team decided that 20 dishes are enough for the meal plan generator.

## Serving weight

Not used in the MVP. Each dish is one fixed serving with its values as listed by the source. The app does not scale portions, so no gram weight is needed. If portion scaling is added later, a serving weight column will be needed.
