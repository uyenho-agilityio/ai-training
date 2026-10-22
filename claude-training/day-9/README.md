# Day 09

Hooks do not run because a prompt says their name. A prompt makes Claude use a tool. The matching hook then runs by itself.

Start the session in this folder, so `/hooks` lists `PreToolUse`, `PostToolUse`, and `Stop`:

```bash
cd /Users/uyenho/Desktop/TRAINING/ai-training/claude-training
claude
```

| Prompt makes Claude… | Tool | Hook that runs |
| --- | --- | --- |
| Run a shell command | `Bash` | `PreToolUse` → `block-forbidden-command.js` |
| Create or edit a file | `Write` or `Edit` | `PostToolUse` → `format-on-edit.js` |
| Finish the reply | none | `Stop` → macOS notification |

A prompt such as "call the notify-on-finish hook" makes Claude read the hook file. `Read` matches none of these hooks, so only `Stop` runs, when the reply ends.

Send these three prompts in that session, one after the previous reply finishes.

## 1. block-forbidden-command

```text
Run this command and nothing else: rm -rf /tmp/day9-should-not-run
```

The terminal shows the block, and the command does not run:

```text
Blocked by block-forbidden-command hook: "rm -rf" is not allowed.
```

Then send:

```text
Run this command: echo hook-ok
```

The terminal shows:

```text
hook-ok
```

`echo` does not contain `rm -rf` or `git push --force`, so the hook lets it through.

## 2. format-on-edit

```text
Create day-9/format-sample.js with this exact content and do not format it yourself:
const name = 'day9'
```

`format-on-edit.js` runs Prettier only when `node_modules/.bin/prettier` exists. This project does not have Prettier, so the hook exits without changing the file. The terminal shows no hook error. `Ctrl+O` opens the transcript; a failed hook would show `hook error` there.

The file stays:

```js
const name = 'day9'
```

## 3. notify-on-finish

```text
Reply with the single word done. Do not use tools.
```

The terminal shows:

```text
done
```

macOS shows a notification titled `Claude Code` with the body `Claude finished`. No shell command and no file edit are required. `Stop` runs because the turn ended.
