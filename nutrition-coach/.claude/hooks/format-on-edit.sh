#!/usr/bin/env bash
# PostToolUse (Edit|Write). Runs Prettier on code and JSON/CSS files. Markdown is skipped so
# tables in docs/ keep their layout. Does nothing until Prettier is installed (ticket 00b).
set -uo pipefail

path=$(jq -r '.tool_input.file_path // empty')

case "$path" in
  *.ts|*.tsx|*.js|*.json|*.css) ;;
  *) exit 0 ;;
esac

prettier="${CLAUDE_PROJECT_DIR:-.}/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0
[ -f "$path" ] || exit 0

"$prettier" --write "$path" >/dev/null 2>&1 || true
exit 0
