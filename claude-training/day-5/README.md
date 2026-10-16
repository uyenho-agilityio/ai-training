# Day 05

Memory, context, and sessions. Do this in Claude Desktop.

Each action is one session. Click **+ New** before every action. Leave the folder set to this directory.

## 1. Write the repo's CLAUDE.md

`CLAUDE.md` in this directory is the file Claude reads at the start of every session.

Paste this in a new session:

```text
Create CLAUDE.md in this directory. Keep it under one screen. English only. Include three parts:
- Commands, run from this directory:
  node --test --experimental-strip-types day-2/app/reload-total.test.ts
  node --test --experimental-strip-types day-2/app/item-count.test.ts
  node --test --experimental-strip-types day-2/app/restore-items.test.ts
- Conventions: committed files are English, and a change fixes only the ticket it names
- Never do: do not add dependencies, and do not change applyCoupon, clearUsedCoupon, or addItem unless the ticket says so
```

Click **+ New** and ask:

```text
How do I run the tests?
```

The answer should repeat the three commands above.

## 2. Auto memory + compaction

Click **+ New**. Paste:

```text
Remember this fact: itemCount must equal the number of items in the cart. It must not subtract 1. Read the files in day-2 and summarize each one.
```

When the summary is done, send:

```text
/compact
```

Then ask:

```text
What did I tell you about itemCount?
```

In Desktop, send:

```text
/context
```

Open Memory files. That list is how Desktop shows what loaded. It has two entries: `CLAUDE.md` in this directory, and `MEMORY.md` under `~/.claude/projects/<project>/memory/`. `CLAUDE.md` is reloaded from disk after compaction. A fact that existed only in the chat is gone unless it was saved into `MEMORY.md`.

`/memory` does not run in the Desktop chat box. It is the terminal command that opens those same files. From this directory:

```bash
claude
```

```text
/memory
```

Write what was still there and what was gone in `day-5/compaction.md`.

## 3. Checkpointing / rewind

Click **+ New**. Paste:

```text
In day-2/app/cart.ts, change reloadTotal so it returns 0.
```

When the edit is done, leave the prompt empty and press Esc twice. Choose the point before that edit.

Open `day-2/app/cart.ts` and confirm `reloadTotal` sums `item.price` again. Write what you restored in `day-5/rewind.md`.

## 4. Prove context matters

Use the same question in two new sessions:

```text
Does reloadTotal write the total back onto the cart? Answer from the code.
```

Session A: click **+ New** and send that question immediately.

Session B: click **+ New** and send this first:

```text
Read day-2/app/cart.ts.
```

After it has read the file, send the same question.

Compare the two answers and the token use. Write the comparison in `day-5/context.md`.
