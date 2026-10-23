#!/usr/bin/env node
// PreToolUse hook: block Bash commands containing forbidden substrings.
// Claude Code passes the tool call as JSON on stdin; exit code 2 blocks the call.

const FORBIDDEN = ['git push --force', 'rm -rf'];

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let command;
  try {
    command = JSON.parse(input).tool_input?.command ?? '';
  } catch {
    console.error('Blocked by block-forbidden-command hook: could not parse the tool input.');
    process.exit(2);
  }
  const hit = FORBIDDEN.find((text) => command.includes(text));
  if (hit) {
    console.error(`Blocked by block-forbidden-command hook: "${hit}" is not allowed.`);
    process.exit(2);
  }
});
