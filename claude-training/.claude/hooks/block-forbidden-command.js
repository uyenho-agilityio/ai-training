#!/usr/bin/env node
// PreToolUse hook: block Bash commands containing forbidden substrings.
// Claude Code passes the tool call as JSON on stdin; exit code 2 blocks the call.

const FORBIDDEN = ['git push --force', 'rm -rf'];

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const command = JSON.parse(input).tool_input?.command ?? '';
  const hit = FORBIDDEN.find((text) => command.includes(text));
  if (hit) {
    console.error(`Blocked by block-forbidden-command hook: "${hit}" is not allowed.`);
    process.exit(2);
  }
});
