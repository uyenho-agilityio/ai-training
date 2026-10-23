# Subagents

A subagent is a side session with its own context. The main chat only receives the summary. Desktop has no picker for these three. The name shows under the chat box.

## Explore

Mode: any mode except Plan. This agent only reads.

Prompt:

```text
Use an Explore agent to read day-2/tickets and list which ticket each function in day-2/app/cart.ts came from. Do not edit files.
```

What appeared:

An **Explore** agent started under the chat. The main session said it was read-only and that no files would change. The agent returned this mapping:

| Function          | Ticket                              |
| ----------------- | ----------------------------------- |
| `reloadTotal`     | `day-2/tickets/01-reload-total.md`  |
| `itemCount`       | `day-2/tickets/02-item-count.md`    |
| `restoreItems`    | `day-2/tickets/03-restore-items.md` |
| `applyCoupon`     | `day-2/tickets/04-coupon.md`        |
| `clearUsedCoupon` | `day-2/tickets/04-coupon.md`        |
| `addItem`         | `day-2/tickets/05-add-item.md`      |

## Plan

Mode: Plan. The file does not change until the plan is approved.

Prompt:

```text
Plan a one-line addition to day-6/subagents.md. Do not edit the file until I approve the plan.
```

What appeared:

Plan mode asked what the one line should say. The choice was "Record the next agent step." After approval, the chat said it added this line: `Next: run the reload-total, item-count and restore-items tests with node --test --experimental-strip-types.` That line is not in this file now.

## General-purpose

Mode: any mode except Plan. This agent can read and edit.

Prompt:

```text
Use a general-purpose agent to find the ticket for addItem and add one line about that ticket to day-6/subagents.md.
```

What appeared:

A **general-purpose** agent started under the chat. It reported that `addItem` is ticket 05, `day-2/tickets/05-add-item.md`, titled "Adding an item also changes the cart I started with." It said it added this line: `addItem's ticket is 05 (day-2/tickets/05-add-item.md): adding an item should leave the cart I started with unchanged.` That line is not in this file now. No cart code was changed.
