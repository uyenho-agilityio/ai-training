#!/usr/bin/env bash
# PreToolUse (Edit|Write). Changes to the approved spec, design and requirement docs ask
# first. Ticket files and docs/plan/ stay editable.
set -uo pipefail

path=$(jq -r '.tool_input.file_path // empty')

if [[ $path =~ (^|/)docs/(spec|design|requirements)/ ]]; then
  jq -cn --arg p "$path" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:("Approved doc " + $p + " (spec, design or requirements). Confirm this change first.")}}'
  exit 0
fi

exit 0
