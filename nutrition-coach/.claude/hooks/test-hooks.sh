#!/usr/bin/env bash
# Runs the "Proof for 00a" cases from docs/plan/claude-setup.md against each hook.
# Each case pipes a sample tool call into the hook and checks the result:
#   block = exit 2, allow = exit 0 with no decision, ask = exit 0 with permissionDecision "ask".
# Run by hand from nutrition-coach/: .claude/hooks/test-hooks.sh   (needs jq and git)
set -uo pipefail

HOOKS_DIR=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

pass=0; fail=0; skip=0
OUT=""; CODE=0

run() { # hook json dir
  OUT=$(cd "$3" && "$HOOKS_DIR/$1" 2>&1 <<< "$2"); CODE=$?
}

check() { # name expected hook json dir
  run "$3" "$4" "$5"
  local ok=0
  case "$2" in
    block) [ "$CODE" -eq 2 ] && ok=1 ;;
    allow) [ "$CODE" -eq 0 ] && [[ $OUT != *permissionDecision* ]] && ok=1 ;;
    ask)   [ "$CODE" -eq 0 ] && [[ $OUT == *'"permissionDecision":"ask"'* ]] && ok=1 ;;
  esac
  if [ "$ok" -eq 1 ]; then
    pass=$((pass + 1)); printf 'PASS  %-24s %-6s %s\n' "$3" "$2" "$1"
  else
    fail=$((fail + 1)); printf 'FAIL  %-24s %-6s %s  (exit %s)\n      %s\n' "$3" "$2" "$1" "$CODE" "$OUT"
  fi
}

skipped() { # name hook reason
  skip=$((skip + 1)); printf 'SKIP  %-24s %s\n      %s\n' "$2" "$1" "$3"
}

bash_json() { jq -cn --arg c "$1" '{tool_name:"Bash",tool_input:{command:$c}}'; }
file_json() { jq -cn --arg t "$1" --arg p "$2" '{tool_name:$t,tool_input:{file_path:$p}}'; }
merge_json() { jq -cn '{tool_name:"mcp__github__merge_pull_request",tool_input:{pull_number:6}}'; }

# --- fixtures -------------------------------------------------------------------------------
mkdir -p "$TMP/on-base" "$TMP/feature"
git init -q -b feat/nutrition-coach "$TMP/on-base"
git -C "$TMP/on-base" -c user.name=test -c user.email=test@test commit -q --allow-empty -m "chore: base"
git -C "$TMP/on-base" update-ref refs/remotes/github/feat/nutrition-coach HEAD

git init -q -b feat/nc-04-log-food "$TMP/feature"
git -C "$TMP/feature" -c user.name=test -c user.email=test@test commit -q --allow-empty -m "chore: base"
git -C "$TMP/feature" update-ref refs/remotes/github/feat/nutrition-coach HEAD
git -C "$TMP/feature" -c user.name=test -c user.email=test@test commit -q --allow-empty -m "feat: step"
git -C "$TMP/feature" branch main HEAD

printf 'TRUNCATE meal_entries;\n' > "$TMP/wipe.sql"
mkdir -p "$TMP/supabase/migrations"
printf 'create table profiles (id uuid);\n' > "$TMP/supabase/migrations/0001_init.sql"

# Test files must not exist yet for the "blocked" cases.
PLAIN="$TMP"

# --- block-forbidden-command.sh -------------------------------------------------------------
H=block-forbidden-command.sh
check "git push to feat/nutrition-coach"        block $H "$(bash_json 'git push github feat/nutrition-coach')" "$PLAIN"
check "git push HEAD while on feat/nutrition-coach" block $H "$(bash_json 'git push github HEAD')" "$TMP/on-base"
check "chained force push to main"              block $H "$(bash_json 'cd x && git push --force github main')" "$PLAIN"
check "git push --all"                          block $H "$(bash_json 'git push github --all')" "$PLAIN"
check "git add -f .env.local"                   block $H "$(bash_json 'git add -f .env.local')" "$PLAIN"
check "git add playwright/.auth/user.json"      block $H "$(bash_json 'git add playwright/.auth/user.json')" "$PLAIN"
check "git push to a feature branch"            allow $H "$(bash_json 'git push -u github feat/nc-01-sign-in')" "$TMP/feature"

# --- block-destructive-db.sh ----------------------------------------------------------------
H=block-destructive-db.sh
check "supabase db reset"                       block $H "$(bash_json 'supabase db reset')" "$PLAIN"
check "supabase db reset --linked"              block $H "$(bash_json 'supabase db reset --linked')" "$PLAIN"
check "psql DROP TABLE"                         block $H "$(bash_json 'psql "$DB_URL" -c "DROP TABLE meal_entries"')" "$PLAIN"
check "supabase db execute wipe.sql (TRUNCATE)" block $H "$(bash_json 'supabase db execute -f wipe.sql')" "$TMP"
check "psql DELETE FROM without WHERE"         block $H "$(bash_json 'psql "$DB_URL" -c "DELETE FROM meal_entries"')" "$PLAIN"
check "supabase migration new"                  allow $H "$(bash_json 'supabase migration new add_index')" "$PLAIN"
check "supabase db diff"                        allow $H "$(bash_json 'supabase db diff')" "$PLAIN"

# --- protect-secrets.sh ---------------------------------------------------------------------
H=protect-secrets.sh
check "Read .env.local"                         block $H "$(file_json Read .env.local)" "$PLAIN"
check "Bash cat .env.local"                     block $H "$(bash_json 'cat .env.local')" "$PLAIN"
check "Bash grep KEY .env.production.local"     block $H "$(bash_json 'grep KEY .env.production.local')" "$PLAIN"
check "Bash cat playwright/.auth/user.json"     block $H "$(bash_json 'cat playwright/.auth/user.json')" "$PLAIN"
check "Read .env.example"                       allow $H "$(file_json Read .env.example)" "$PLAIN"
check "Edit .env.example"                       allow $H "$(file_json Edit .env.example)" "$PLAIN"

# --- protect-migrations.sh ------------------------------------------------------------------
H=protect-migrations.sh
check "Edit existing 0001_init.sql"            block $H "$(file_json Edit "$TMP/supabase/migrations/0001_init.sql")" "$PLAIN"
check "Write new 0002 migration"               allow $H "$(file_json Write "$TMP/supabase/migrations/0002_add_index.sql")" "$PLAIN"

# --- approve-merge.sh -----------------------------------------------------------------------
H=approve-merge.sh
check "merge_pull_request asks"                ask   $H "$(merge_json)" "$PLAIN"

# --- check-commit-message.sh ----------------------------------------------------------------
H=check-commit-message.sh
check "one-line docs commit"                   allow $H "$(bash_json 'git commit -m "docs: add build plan and setup tickets for Nutrition Coach"')" "$PLAIN"
check "commit with a body paragraph"           block $H "$(bash_json 'git commit -m "docs: add x" -m "body text"')" "$PLAIN"
check "commit with Co-Authored-By trailer"     block $H "$(bash_json "$(printf 'git commit -m "docs: add x\n\nCo-Authored-By: Someone <a@b.c>"')")" "$PLAIN"
check "subject without <type>:"                block $H "$(bash_json 'git commit -m "add some stuff"')" "$PLAIN"
check "subject over 72 characters"             block $H "$(bash_json "git commit -m \"feat: $(printf 'x%.0s' $(seq 1 80))\"")" "$PLAIN"
check "git commit without -m"                  block $H "$(bash_json 'git commit --amend --no-edit')" "$PLAIN"

# --- protect-approved-docs.sh ---------------------------------------------------------------
H=protect-approved-docs.sh
check "Edit docs/spec/spec.md"                 ask   $H "$(file_json Edit docs/spec/spec.md)" "$PLAIN"
check "Edit a ticket file"                     allow $H "$(file_json Edit docs/tickets/01-sign-in-with-google.md)" "$PLAIN"
check "Edit docs/plan/plan.md"                 allow $H "$(file_json Edit docs/plan/plan.md)" "$PLAIN"

# --- require-test-first.sh ------------------------------------------------------------------
H=require-test-first.sh
check "utils file before its test"            block $H "$(file_json Write "$TMP/src/utils/targets.ts")" "$PLAIN"
check "component before its test"              block $H "$(file_json Write "$TMP/src/components/TotalsCards/index.tsx")" "$PLAIN"
mkdir -p "$TMP/src/utils/__tests__" "$TMP/src/components/TotalsCards"
touch "$TMP/src/utils/__tests__/targets.test.ts" "$TMP/src/components/TotalsCards/index.test.tsx"
check "utils file after its test"              allow $H "$(file_json Write "$TMP/src/utils/targets.ts")" "$PLAIN"
check "component after its test"               allow $H "$(file_json Write "$TMP/src/components/TotalsCards/index.tsx")" "$PLAIN"
check "supabase/auth.ts (not checked)"         allow $H "$(file_json Write "$TMP/src/utils/supabase/auth.ts")" "$PLAIN"
check "utils/index.ts (not checked)"           allow $H "$(file_json Write "$TMP/src/utils/index.ts")" "$PLAIN"
check "icon file (not checked)"                allow $H "$(file_json Write "$TMP/src/icons/Logo.tsx")" "$PLAIN"

# --- check-branch-base.sh -------------------------------------------------------------------
H=check-branch-base.sh
check "new branch from github/feat/nutrition-coach" allow $H "$(bash_json 'git switch -c feat/nc-04-log-food github/feat/nutrition-coach')" "$TMP/feature"
check "new branch from a feature branch"       block $H "$(bash_json 'git switch -c feat/nc-05-delete')" "$TMP/feature"
check "worktree from main"                      block $H "$(bash_json 'git worktree add -b x ../x main')" "$TMP/feature"

# --- format-on-edit.sh ----------------------------------------------------------------------
H=format-on-edit.sh
printf 'const a = {b:1}\n' > "$TMP/sample.ts"
printf '# Title\n|a|b|\n' > "$TMP/sample.md"
check "Edit a .md file (skipped)"              allow $H "$(file_json Edit "$TMP/sample.md")" "$PLAIN"
check "Edit a .ts file, no Prettier yet"       allow $H "$(file_json Edit "$TMP/sample.ts")" "$PLAIN"
if [ "$(cat "$TMP/sample.ts")" = 'const a = {b:1}' ]; then
  pass=$((pass + 1)); printf 'PASS  %-24s %-6s %s\n' "$H" "untouched" ".ts file left as written (no Prettier)"
else
  fail=$((fail + 1)); printf 'FAIL  %-24s %-6s .ts file changed without Prettier\n' "$H" "untouched"
fi
skipped "Prettier runs on a .ts edit" "$H" "needs node_modules/.bin/prettier, installed in ticket 00b"

echo
echo "Result: $pass passed, $fail failed, $skip skipped"
[ "$fail" -eq 0 ]
