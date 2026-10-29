#!/usr/bin/env bash
# PreToolUse (Bash). A git commit must have exactly one line: "<type>: <summary>".
# No body, no trailer lines (such as Co-Authored-By), no -m repeated, no editor (-m or -F required).
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
[ -z "$cmd" ] && exit 0

deny() { echo "BLOCKED (check-commit-message): $1" >&2; exit 2; }

[[ $cmd =~ git[[:space:]]+commit ]] || exit 0

# The whole command is checked for a multi-line message (a body) and for trailers.
[[ $cmd == *$'\n'* ]] && deny "the commit message must be one line (no body)"
shopt -s nocasematch
[[ $cmd == *co-authored-by* ]] && deny "trailer lines such as Co-Authored-By are not allowed"
shopt -u nocasematch

rest=${cmd#*git commit}

if [[ $rest =~ (^|[[:space:]])(-F|--file)([[:space:]=]+)([^[:space:]]+) ]]; then
  file=${BASH_REMATCH[4]}
  [ "$file" = "-" ] && deny "-F - (stdin) cannot be checked; write the message with -m"
  [ -f "$file" ] || deny "message file '$file' not found"
  msg=$(cat "$file")
  msg=${msg%$'\n'}
  [[ $msg == *$'\n'* ]] && deny "the commit message file must be one line (no body)"
else
  count=$(printf '%s' "$rest" | grep -oE '(^|[[:space:]])(-m|--message)([[:space:]]|")' | wc -l | tr -d ' ')
  [ "$count" -eq 0 ] && deny "git commit needs -m \"<type>: <summary>\" (an editor would open)"
  [ "$count" -gt 1 ] && deny "only one -m allowed; a second -m adds a body paragraph"
  re1='-m[[:space:]]*"([^"]*)"'
  re2="-m[[:space:]]*'([^']*)'"
  re3='-m[[:space:]]+([^[:space:]]+)'
  if [[ $rest =~ $re1 ]]; then msg=${BASH_REMATCH[1]}
  elif [[ $rest =~ $re2 ]]; then msg=${BASH_REMATCH[1]}
  elif [[ $rest =~ $re3 ]]; then msg=${BASH_REMATCH[1]}
  else deny "could not read the -m message"
  fi
fi

types='feat|fix|docs|chore|refactor|test|style|perf|ci|build'
[[ $msg =~ ^($types):\ (.+)$ ]] || deny "message must start with <type>: (one of feat, fix, docs, chore, refactor, test, style, perf, ci, build)"
summary=${BASH_REMATCH[2]}
[ "${#summary}" -le 72 ] || deny "summary is ${#summary} characters; the limit is 72"

exit 0
