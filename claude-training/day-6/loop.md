# Loop

Run both commands in one Code session on this branch. The session has to stay open. In the terminal, press Esc to stop a loop. In the Desktop app, Esc does not stop it, and the job does not appear under Scheduled. Reopen the same session and cancel it in chat with `CronDelete`.

## Built-in maintenance

```text
/loop 15m
```

This uses the built-in maintenance prompt and repeats every 15 minutes. Point it at the open merge request for this branch.

## Custom check

```text
/loop 5m check the deploy
```

This repeats the deploy check every 5 minutes.

## What I noticed

### `/loop 15m`

The first check found nothing to act on. This conversation has no in-progress work. The branch's PR, CI, and review threads could not be checked because `gh` is not installed in this shell.

Schedule: job `5fd52468`, cron `*/15 * * * *` (every 15 minutes). The next run was around 3:33pm local. The job lives only in this session and auto-expires after 7 days. Cancel sooner with `CronDelete` and job ID `5fd52468`. The autonomous-loop instructions are baked into the job.

### `/loop 5m check the deploy`

The 5-minute check was scheduled, but the deploy could not be checked. No service or URL was named, and nothing reachable shows a deploy status.

Schedule: job `ec336e12`, cron `*/5 * * * *` (every 5 minutes). The next run was around 3:31pm local. The job is session-only and auto-expires after 7 days. Cancel sooner with `CronDelete` and job ID `ec336e12`.

This training repo has no deploy config. The sibling `ai-travel-planner-practice` has a `.vercel` folder, but no project link file in it. There is no Vercel, Netlify, Fly, or Render CLI here, and `gh` is not installed. A later run needs a service and a URL or project to watch.
