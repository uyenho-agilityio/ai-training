# Day 06

Do this in the Claude Desktop app. The open folder is this directory. Each action is its own session. Click **+ New** before every action.

The artifact and the loop are already recorded.

- Artifact: `day-6/artifact.md`
- Loop: `day-6/loop.md`

## Remote Control

Click **+ New**. In the chat box, send:

```text
/rc
```

Accept the one-time confirmation. On the phone, open https://claude.ai/code with the same account and open this session.

From the phone, send:

```text
Summarize day-2/app/cart.ts in three lines.
```

Screenshot that phone message for the channel. Write what came back in `day-6/remote.md`.

## Ultracode family: deep reasoning only where it pays

Click **+ New**. Send the question and the word `ultrathink` in the same message. `ultrathink` by itself is not a task.

```text
ultrathink addItem copies the items array, but the item object inside that array is still the same object the caller passed in. What breaks if the caller later changes that item's price? Answer from day-2/app/cart.ts.
```

Click **+ New** again. Send `/effort low`. That command only sets the level, so it may show no answer. Then send the same question without `ultrathink`.

Write both answers, the level you picked, and which levels the picker offered in `day-6/effort.md`.

## Subagents

There is no menu for the three built-in subagents. A subagent is a side session. The main chat only receives its summary. Watch the name under the chat box. Open **⋮** then **Background tasks** to see its output.

**Explore** reads files and does not edit them. Leave the mode on **Manual**, **Accept edits**, or **Auto**. Click **+ New** and send:

```text
Use an Explore agent to read day-2/tickets and list which ticket each function in day-2/app/cart.ts came from. Do not edit files.
```

**Plan** runs only in **Plan** mode. Click **+ New**, set the mode to **Plan**, and send:

```text
Plan a one-line addition to day-6/subagents.md. Do not edit the file until I approve the plan.
```

The file stays unchanged until you approve.

**General-purpose** searches and edits. Use any mode except **Plan**. Click **+ New** and send:

```text
Use a general-purpose agent to find the ticket for addItem and add one line about that ticket to day-6/subagents.md.
```

Write what appeared under the chat box for each one in `day-6/subagents.md`.

## Exercise screenshots

Three shots for the channel:

1. The artifact page in `day-6/artifact.md`.
2. One loop run from `day-6/loop.md`.
3. The phone steer from Remote Control.
