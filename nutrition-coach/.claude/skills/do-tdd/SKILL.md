---
name: do-tdd
description: Build one ticket slice test-first (red, green, next test). Used by /do-task, or run alone with a seam.
---

# do-tdd

Usage: `/do-tdd <seam>` (or called by `/do-task` with the agreed seams).

Refactoring is not part of this loop. It happens in the review step of `/do-task`.

## Steps

1. Read the agreed seams for the ticket (from the plan approved at gate 1). If the seam is not agreed, stop and ask. Do not invent a seam.
2. For each slice:
   1. Write **one** failing test at the seam:
      - Vitest in `__tests__/<name>.test.ts` for functions, constants, schemas, stores and hooks
      - Vitest + Testing Library in `<Name>/index.test.tsx` for components
      - Playwright in `e2e/<ticket>-*.spec.ts` for a step of the user flow
   2. Run it and check it **fails for the right reason** (a missing export or a wrong value, not a typo). Record the result.
   3. Write the least code that makes it pass.
   4. Run it green, along with the other tests in that file.
   5. Commit the test and the code together, as one line: `<type>: <summary>`.
   6. Next slice.

## Rules

- Expected values come from the spec, the food list, or a worked example worked out by hand. Never recompute them the way the code does.
- Only these may be replaced in tests: Supabase, Server Actions (in component tests), the clock, and the random source. `todayInVietnam(now)` and `generateSamplePlan(..., random)` take those as arguments.
- Component tests check what the user sees and does (text, roles, clicks). They do not check internal state.
- No tests of internals or private functions.
- No refactor inside the loop.
- Pages stay thin. A page that is async cannot be unit tested; Playwright covers it.
