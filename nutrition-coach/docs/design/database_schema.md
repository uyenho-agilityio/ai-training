# 03 Database schema

Status: agreed in stage 2 design session, 2026-10-28.

Database: Supabase PostgreSQL. Every table has Row Level Security enabled. Every row has a `user_id` that matches `auth.users.id` from Supabase Auth.

## Table: profiles

One row per user.

| Column | Type | Rules |
|---|---|---|
| `user_id` | uuid, primary key | References `auth.users.id`, on delete cascade |
| `sex` | text | `male` or `female` |
| `age` | integer | Positive |
| `height_cm` | numeric(5,1) | Positive |
| `weight_kg` | numeric(5,1) | Positive |
| `activity_level` | text | One of `sedentary`, `light`, `moderate`, `active`, `very_active` |
| `body_fat_percent` | numeric(4,1), nullable | If set, Katch-McArdle is used |
| `updated_at` | timestamptz | Set on each save |

## Table: custom_foods

Foods added by the user. One row per food.

| Column | Type | Rules |
|---|---|---|
| `id` | uuid, primary key | |
| `user_id` | uuid | References `auth.users.id`, on delete cascade |
| `name` | text | Required, not empty |
| `kcal` | numeric(7,1) | Not negative |
| `protein_g` | numeric(6,1) | Not negative |
| `carb_g` | numeric(6,1) | Not negative |
| `fat_g` | numeric(6,1) | Not negative |
| `created_at` | timestamptz | |

No limit on the number of rows at the application level.

## Table: meal_entries

One row for each food logged. A deleted row is removed from the table.

| Column | Type | Rules |
|---|---|---|
| `id` | uuid, primary key | |
| `user_id` | uuid | References `auth.users.id`, on delete cascade |
| `entry_date` | date | Calendar day in Asia/Ho_Chi_Minh, set when logged |
| `food_code` | text, nullable | Code of a built-in dish, for example `HAN-112048` |
| `custom_food_id` | uuid, nullable | References `custom_foods.id`, on delete set null |
| `name` | text | Name copied from the food at logging time |
| `kcal` | numeric(7,1) | Copied at logging time |
| `protein_g` | numeric(6,1) | Copied at logging time |
| `carb_g` | numeric(6,1) | Copied at logging time |
| `fat_g` | numeric(6,1) | Copied at logging time |
| `created_at` | timestamptz | |

Rules:
- Exactly one of `food_code` and `custom_food_id` is set.
- Values are copied, not joined. Changing a food later does not change past entries.
- Today's list is `meal_entries` where `user_id` is the current user and `entry_date` is today in Asia/Ho_Chi_Minh.

## Row Level Security

For each table:

- Enable RLS.
- Policy for select, insert, update and delete: allowed only when `user_id = auth.uid()`.
- Inserts also set `user_id` to `auth.uid()`, so a client cannot write into another user's rows.

## Totals

- Eaten today: sum of `kcal`, `protein_g`, `carb_g`, `fat_g` over today's `meal_entries`.
- Remaining: target minus eaten. Can be negative.
- Totals are computed on read, not stored.
