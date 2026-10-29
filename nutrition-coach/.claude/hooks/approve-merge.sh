#!/usr/bin/env bash
# PreToolUse (mcp__github__merge_pull_request). Every merge asks the user first (gate 3).
# The hook cannot read CI or review state itself; the prompt tells the user to check them.
set -uo pipefail

pr=$(jq -r '.tool_input.pull_number // .tool_input.pullNumber // "unknown"')

jq -cn --arg pr "$pr" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:("Merge PR #" + $pr + "? Check CI state and the review verdict on GitHub before approving (gate 3).")}}'
exit 0
