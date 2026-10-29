#!/usr/bin/env bash
# PreToolUse (Edit|Write). An existing migration is never changed; a schema change is a new
# numbered migration file.
set -uo pipefail

path=$(jq -r '.tool_input.file_path // empty')

if [[ $path == *supabase/migrations/* ]] && [ -e "$path" ]; then
  echo "BLOCKED (protect-migrations): '$path' already exists. Add a new numbered migration instead." >&2
  exit 2
fi

exit 0
