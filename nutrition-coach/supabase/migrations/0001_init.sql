-- 0001_init: profiles, custom_foods, meal_entries with Row Level Security.
-- Source: docs/design/database_schema.md

-- profiles: one row per user
create table public.profiles (
  user_id uuid primary key default auth.uid()
    references auth.users (id) on delete cascade,
  sex text not null check (sex in ('male', 'female')),
  age integer not null check (age > 0),
  height_cm numeric(5, 1) not null check (height_cm > 0),
  weight_kg numeric(5, 1) not null check (weight_kg > 0),
  activity_level text not null
    check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  body_fat_percent numeric(4, 1),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- custom_foods: foods added by the user
create table public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  kcal numeric(7, 1) not null check (kcal >= 0),
  protein_g numeric(6, 1) not null check (protein_g >= 0),
  carb_g numeric(6, 1) not null check (carb_g >= 0),
  fat_g numeric(6, 1) not null check (fat_g >= 0),
  created_at timestamptz not null default now(),
  -- lets meal_entries point only at the same user's custom foods
  unique (id, user_id)
);

create index custom_foods_user_id_idx on public.custom_foods (user_id);

-- meal_entries: one row per food logged, values copied at logging time
create table public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  entry_date date not null,
  food_code text,
  custom_food_id uuid,
  name text not null,
  kcal numeric(7, 1) not null,
  protein_g numeric(6, 1) not null,
  carb_g numeric(6, 1) not null,
  fat_g numeric(6, 1) not null,
  created_at timestamptz not null default now(),
  constraint meal_entries_one_source
    check ((food_code is null) <> (custom_food_id is null)),
  constraint meal_entries_custom_food_fk
    foreign key (custom_food_id, user_id)
    references public.custom_foods (id, user_id)
    on delete set null (custom_food_id)
);

create index meal_entries_user_id_entry_date_idx
  on public.meal_entries (user_id, entry_date);

-- Row Level Security: each user sees and changes only their own rows
alter table public.profiles enable row level security;
alter table public.custom_foods enable row level security;
alter table public.meal_entries enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (user_id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using (user_id = auth.uid());

create policy "custom_foods_select_own" on public.custom_foods
  for select to authenticated using (user_id = auth.uid());
create policy "custom_foods_insert_own" on public.custom_foods
  for insert to authenticated with check (user_id = auth.uid());
create policy "custom_foods_update_own" on public.custom_foods
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "custom_foods_delete_own" on public.custom_foods
  for delete to authenticated using (user_id = auth.uid());

create policy "meal_entries_select_own" on public.meal_entries
  for select to authenticated using (user_id = auth.uid());
create policy "meal_entries_insert_own" on public.meal_entries
  for insert to authenticated with check (user_id = auth.uid());
create policy "meal_entries_update_own" on public.meal_entries
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "meal_entries_delete_own" on public.meal_entries
  for delete to authenticated using (user_id = auth.uid());
