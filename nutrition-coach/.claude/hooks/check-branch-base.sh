#!/usr/bin/env bash
# PreToolUse (Bash). A new branch or worktree must start from github/feat/nutrition-coach.
# Allowed when the start point resolves to the same commit as that ref (a missing start point
# means the current HEAD).
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
[ -z "$cmd" ] && exit 0

deny() { echo "BLOCKED (check-branch-base): $1" >&2; exit 2; }

base=$(git rev-parse --verify -q refs/remotes/github/feat/nutrition-coach^{commit} 2>/dev/null || true)
[ -z "$base" ] && deny "cannot find github/feat/nutrition-coach; fetch it first"

check_start() {
  local start=$1 sha
  sha=$(git rev-parse --verify -q "$start^{commit}" 2>/dev/null || true)
  [ -z "$sha" ] && deny "start point '$start' does not exist"
  [ "$sha" = "$base" ] || deny "new branch must start from github/feat/nutrition-coach, not '$start'"
}

segments=$(printf '%s' "$cmd" | sed -E 's/&&|\|\||;|\|/\n/g')

while IFS= read -r seg; do
  read -ra t <<< "$seg"
  for ((i = 0; i < ${#t[@]}; i++)); do
    [ "${t[i]}" = git ] || continue
    sub=${t[i+1]:-}
    rest=("${t[@]:i+2}")

    case "$sub" in
      switch|checkout)
        name=""; start=""; creating=0; skip=0
        for ((j = 0; j < ${#rest[@]}; j++)); do
          tok=${rest[j]}
          case "$tok" in
            -c|-C|-b|-B) creating=1; name=${rest[j+1]:-}; skip=1; continue ;;
          esac
          if [ "$skip" -eq 1 ]; then skip=0; continue; fi
          case "$tok" in -*) continue ;; esac
          [ -z "$start" ] && [ "$creating" -eq 1 ] && start=$tok
        done
        if [ "$creating" -eq 1 ]; then
          check_start "${start:-HEAD}"
        fi
        ;;
      branch)
        positional=()
        flagged=0
        for tok in "${rest[@]}"; do
          case "$tok" in -*) flagged=1; continue ;; esac
          positional+=("$tok")
        done
        if [ "$flagged" -eq 0 ] && [ "${#positional[@]}" -ge 1 ]; then
          check_start "${positional[1]:-HEAD}"
        fi
        ;;
      worktree)
        [ "${rest[0]:-}" = add ] || continue
        positional=(); creating=0; skip=0
        for ((j = 1; j < ${#rest[@]}; j++)); do
          tok=${rest[j]}
          if [ "$skip" -eq 1 ]; then skip=0; continue; fi
          case "$tok" in
            -b|-B) creating=1; skip=1; continue ;;
            -*) continue ;;
          esac
          positional+=("$tok")
        done
        # positional[0] is the path, positional[1] the optional start point
        if [ "$creating" -eq 1 ]; then
          check_start "${positional[1]:-HEAD}"
        fi
        ;;
    esac
  done
done <<< "$segments"

exit 0
