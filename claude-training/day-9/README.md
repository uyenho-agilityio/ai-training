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

## Automation ladder

Do these four steps in order. The hook commit is already on `feat/day-9-hook`. Do not push and do not open a pull request until step 4 is finished. `/goal`, the local routine, and the cloud routines page do not install anything on GitHub. Only `/install-github-app` lets `@claude` review a pull request.

### 1. /goal

In a new Claude Code session, from `claude-training`:

```text
/goal Create day-9/goal.md with one English sentence: The block-forbidden-command hook blocks git push --force and rm -rf. Stop when that file exists and contains that sentence.
```

Done when `day-9/goal.md` contains that sentence. Commit that file on `feat/day-9-hook`. Leave the pull request closed.

### 2. Local morning routine

In the Claude Desktop app, open the Code tab. In the sidebar, choose Routines, or More then Routines. Choose New routine, then Local. The computer must be on for this routine to run.

Schedule it for the morning. Prompt:

```text
Morning briefing for /Users/uyenho/Desktop/TRAINING/ai-training. In five lines, say the current branch, whether claude-training/day-9/hooks.md exists, and the last commit subject. Do not edit files.
```

Run it once. Write the time and the five lines into `claude-training/day-9/routine-local.md`.

### 3. Cloud routines

Open https://claude.ai/code/routines. Write three lines in `claude-training/day-9/routine-cloud.md`: a cloud routine runs while the computer is off, how that differs from the local routine, and whether you created one or only looked.

### 4. @claude on the next pull request

In a Claude Code session at the repo root:

```text
/install-github-app
```

Install the app on `uyenho-agilityio/ai-training`. Then:

```bash
git push -u github feat/day-9-hook
```

Open a pull request from `feat/day-9-hook` on GitHub. `@claude` reviews that pull request. If no review appears, comment:

```text
@claude review
```

Write each review comment in `claude-training/day-9/review.md` as useful, wrong, or out of scope.
