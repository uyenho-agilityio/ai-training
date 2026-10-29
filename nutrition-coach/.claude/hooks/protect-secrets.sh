#!/usr/bin/env bash
# PreToolUse (Read|Edit|Write|Bash). Blocks reading or changing local env files and the
# saved Playwright sign-in state. .env.example is allowed.
set -uo pipefail

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')
deny() { echo "BLOCKED (protect-secrets): $1" >&2; exit 2; }

is_secret_path() {
  local p=$1 base
  base=${p##*/}
  [[ $base =~ ^\.env(\..*)?\.local$ ]] && return 0
  [[ $p == *playwright/.auth/* ]] && return 0
  return 1
}

case "$tool" in
  Bash)
    cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
    if printf '%s' "$cmd" | grep -Eq '\.env[^[:space:]"'"'"'/]*\.local|playwright/\.auth'; then
      deny "command touches a local env file or Playwright sign-in state"
    fi
    ;;
  Read|Edit|Write)
    path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
    is_secret_path "$path" && deny "'$path' is a local secret or sign-in file"
    ;;
esac

exit 0
