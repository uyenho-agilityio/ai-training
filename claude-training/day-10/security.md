# /security-review

Branch: `feat/day-9-hook`. Session on 23 Oct 2026. Nothing met the reporting bar (confidence at least 8 and a concrete exploit path).

Checked and not reported:

- `block-forbidden-command.js` fails closed on malformed input. The substring list is a training guardrail, not a security boundary.
- `format-on-edit.js` runs Prettier without a shell. `CLAUDE_PROJECT_DIR` is a trusted environment variable.
- The `Stop` hook runs a fixed `osascript` string.
- `cart.ts` and `repro.ts` are arithmetic and logging.
- `package.json` adds only the allowed `typescript` devDependency.
- Committed Playwright snapshots have no tokens, passwords, or personal email addresses.

## Claude Security scan

`/claude-security` scanned the 4 commits on `feat/day-9-hook` since `github/feat/claude-training`, at medium effort. One finding, rated low.

`format-on-edit.js` runs `node_modules/.bin/prettier` after every edit. An agent that can write that path could replace the binary, and the next edit would run it. This checkout has no Prettier binary, so the hook does not run today. The panel kept it at low. One voter called it a false positive, because the same write access could already replace the hook file itself.

Two other candidates were rejected: the substring list in `block-forbidden-command.js` missing some `rm` and `git push` spellings, and the notes in `day-10/security.md`.
