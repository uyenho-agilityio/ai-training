# Permission modes

One session. This file is the only file Claude may edit. Do not touch `cart.ts`.

Before each prompt, click the mode name under the chat box (it may say Auto) and choose the mode for that step. Skip **Bypass permissions**.

## Manual

Course name: `default`. Menu name: **Manual**.

Prompt:

> Add one line under the heading "Throwaway line" in the Manual section of `day-4/modes.md`. The line is exactly `manual was here`. Do not change any other line or any other file.

Throwaway line:
manual was here

What I noticed:
Claude asked before writing the file. The line `manual was here` appeared only after I approved.

## Accept edits

Course name: `acceptEdits`. Menu name: **Accept edits**.

Prompt:

> Add one line under the heading "Throwaway line" in the Accept edits section of `day-4/modes.md`. The line is exactly `accept edits was here`. Do not change any other line or any other file.

Throwaway line:
accept edits was here

What I noticed:
Claude wrote `accept edits was here` without asking me to approve the edit.

## Plan

Course name: `plan`. Menu name: **Plan**.

Prompt:

> Add one line under the heading "Throwaway line" in the Plan section of `day-4/modes.md`. The line is exactly `plan was here`. Do not change any other line or any other file.

Throwaway line:
plan was here

What I noticed:
Claude showed a plan and waited. The line `plan was here` appeared only after I approved the plan.

## Auto

Course name: `auto`. Menu name: **Auto**.

Prompt:

> Add one line under the heading "Throwaway line" in the Auto section of `day-4/modes.md`. The line is exactly `auto was here`. Do not change any other line or any other file.

Throwaway line:
auto was here

What I noticed:
Claude wrote `auto was here` on its own. There was no approval prompt.
