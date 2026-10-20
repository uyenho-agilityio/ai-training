---
name: how-we-write-migrations
description: Write a database migration safely. Use when adding or changing a schema, table, column, index, or data backfill.
---

# How we write migrations

One migration does one schema change. Name the file with a timestamp and a short verb, for example `20261020_add_cart_item_quantity.ts`.

## Rules

1. Prefer additive changes. Add a nullable column or a new table first. Do not rename or drop in the same migration.
2. Expand, then migrate, then contract. Deploy code that reads both old and new shapes before you delete the old column.
3. Never edit a migration that already ran in shared environments. Add a new migration instead.
4. Every migration has a forward step and a reverse step. The reverse step must undo the forward step on an empty local database.
5. Backfills run in batches. Do not lock a large table for the whole update.
6. Indexes on existing tables are created concurrently when the database supports it.
7. Do not put application business logic in a migration. Move that into a script or a ticketed code change.

## Checklist before the MR

- [ ] Forward migration runs on an empty local database
- [ ] Reverse migration runs and returns to the previous schema
- [ ] A second forward run fails cleanly or is a no-op
- [ ] The MR only contains this migration and the code the ticket names
- [ ] Rollback steps are written in the MR description

## Never do

- Do not squash or rewrite migrations that teammates may already have applied
- Do not couple a breaking column drop with the code that still needs that column
- Do not invent a migration tool that this repo does not already use
