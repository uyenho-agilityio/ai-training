#!/usr/bin/env bash
# PreToolUse (Bash). Blocks destructive database commands, whether typed directly,
# inside psql/supabase arguments, or inside a .sql file passed to the command.
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
[ -z "$cmd" ] && exit 0

deny() { echo "BLOCKED (block-destructive-db): $1" >&2; exit 2; }

# Supabase CLI commands that wipe or delete remote state.
if printf '%s' "$cmd" | grep -Eiq 'supabase[[:space:]]+(db[[:space:]]+reset|projects[[:space:]]+delete|migration[[:space:]]+repair)'; then
  deny "destructive Supabase command"
fi
if printf '%s' "$cmd" | grep -Eiq 'supabase[[:space:]]+db[[:space:]]+push.*--include-all'; then
  deny "supabase db push --include-all"
fi

# SQL to check: the command text plus any .sql file it names that exists in the current folder.
sql=$cmd
for tok in $cmd; do
  tok=${tok//\"/}
  tok=${tok//\'/}
  case "$tok" in
    *.sql) [ -f "$tok" ] && sql+=$'\n'"$(cat "$tok")" ;;
  esac
done

if printf '%s' "$sql" | grep -Eiq 'drop[[:space:]]+(table|schema|database)'; then
  deny "DROP TABLE / SCHEMA / DATABASE"
fi
if printf '%s' "$sql" | grep -Eiq '(^|[^a-zA-Z_])truncate([^a-zA-Z_]|$)'; then
  deny "TRUNCATE"
fi

# DELETE FROM without WHERE: check each statement (split on ';', newlines joined).
statements=$(printf '%s' "$sql" | tr '\n' ' ' | tr ';' '\n')
while IFS= read -r stmt; do
  if printf '%s' "$stmt" | grep -Eiq 'delete[[:space:]]+from' && ! printf '%s' "$stmt" | grep -Eiq '(^|[[:space:]])where([[:space:]]|$)'; then
    deny "DELETE FROM without WHERE"
  fi
done <<< "$statements"

exit 0
