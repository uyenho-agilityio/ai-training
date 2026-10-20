# Plugin

Installed from Discover in a Code session with `/plugin`.

Plugin: `typescript-lsp@claude-plugins-official` (TypeScript LSP), version `1.0.0`.

## Setup that made the LSP tool work

1. Plugin alone is not enough. Install the language server binary with pnpm:

```bash
pnpm add -g typescript-language-server typescript@5.8.3
```

Use TypeScript 5.x. TypeScript 7.0.2 in this environment did not ship `tsserver.js` the way the language server expects.

2. The language server also needs TypeScript in the workspace, not only globally. From `claude-training`:

```bash
pnpm add -D typescript@5.8.3
```

3. Add `tsconfig.json` so the server knows which files belong to the project.

4. Restart the Claude Code session after those installs.

## What failed before the fix

Prompt:

```text
Use the LSP tool only. Do not use Read or Grep. What is the hover type of addItem in day-2/app/cart.ts?
```

Claude did call the **LSP** tool (`hover`, `documentSymbol`, `workspaceSymbol`). Every call failed at initialize:

```text
Could not find a valid TypeScript installation. Please ensure that the "typescript" dependency is installed in the workspace or that a valid tsserver.path is specified.
```

## What to ask after the fix

Restart Claude Code, then send the same prompt. The tool under the chat should be **LSP**, not **Read**.

## What LSP is for

LSP (Language Server Protocol) is the same engine your editor uses for hover types, go-to-definition, find references, and type errors. The plugin wires that engine into Claude Code as a tool named **LSP**.

Without LSP, Claude opens `cart.ts` and reads the text. With LSP, Claude asks the TypeScript server: what is the type at this position, where is this symbol defined, who calls it, and did my last edit introduce a type error.

Useful on a large TypeScript app: rename-safe navigation, “who calls this?”, and catching type errors right after an edit.

Not very useful on this Day 2 cart: one small file already spells out `: Cart`. Reading the file answers the same question. The value here was learning how to turn the plugin on, not changing how the cart is fixed.

## Honest evaluation

Helped after `typescript@5.8.3` lived in this folder and `tsconfig.json` existed: Claude could call the **LSP** tool instead of **Read**.

Did not help with only `/plugin` and a global install: the server failed with “Could not find a valid TypeScript installation.” For this tiny cart, LSP also does not beat a simple file read for “what does `addItem` return?”
