# Compaction

After `/compact`, `/context` still listed two memory files.

## Still there

- `CLAUDE.md` in this directory. It holds the test commands, the conventions, and the never-do list. Compaction reloads it from disk.
- The itemCount rule in auto memory. `MEMORY.md` points at `item-count-rule.md`: `itemCount` equals the number of cart items and must not subtract 1. That note was saved before compaction, so it survived.

## Gone

The summary of each file in `day-2` was only in the chat. It was not written to `CLAUDE.md` or to a memory file, so that summary is gone after `/compact`.
