# Rewind

A checkpoint is a snapshot Claude Code takes before each edit in a session. `/rewind`, or `Esc` `Esc` on an empty prompt, opens the menu for that snapshot. This is separate from git.

## Bad edit

The prompt was: in `day-2/app/cart.ts`, change `reloadTotal` so it returns 0.

After the edit, `reloadTotal` was `return 0`. It no longer added `item.price`.

## Restored

The rewind menu was opened on that prompt. The choice was Restore code and conversation.

`reloadTotal` sums `item.price` again, starting from 0. The prompt that asked for `return 0` is no longer part of the session.
