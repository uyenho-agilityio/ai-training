#!/usr/bin/env node
// PostToolUse hook for Edit|Write: format the edited file with the project's
// local Prettier, if one is installed. No dependency is added; with no local
// Prettier this is a no-op.

const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
const prettier = path.join(projectDir, 'node_modules', '.bin', 'prettier');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const filePath = JSON.parse(input).tool_input?.file_path ?? '';
  if (!filePath || !existsSync(prettier)) process.exit(0);

  const result = spawnSync(prettier, ['--write', filePath], { stdio: 'inherit' });
  process.exit(result.status ?? 0);
});
