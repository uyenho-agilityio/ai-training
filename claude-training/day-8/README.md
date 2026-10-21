# Day 08

Do this in a terminal, from the repo root. Run the `claude mcp` commands outside a Claude session. Restart the session after each add.

The GitHub connector reads pull requests on `uyenho-agilityio/ai-training` (remote `github`).

## 1. GitHub connector

The course command signs in with OAuth. That fails here:

```text
Incompatible auth server: does not support dynamic client registration
```

Clicking **Authenticate** or **Reconnect** fails again, this time with `HTTP 400`. Use a personal access token instead.

1. Create a fine-grained token at https://github.com/settings/personal-access-tokens. Limit it to this repo. Permissions: **Pull requests: Read and write**, **Metadata: Read**.
2. In the terminal, not inside `claude`:

```bash
claude mcp remove github
export GITHUB_PERSONAL_ACCESS_TOKEN='paste-the-token-here'
claude mcp add --transport http github https://api.githubcopilot.com/mcp \
  --header "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN"
```

The shell must expand `$GITHUB_PERSONAL_ACCESS_TOKEN` before Claude stores the header. Do not wrap the token in `${...}`. That stores a variable name, GitHub rejects the header, and `/mcp` shows `HTTP 400`.

3. Start a session and check the server. Do not press Authenticate.

```bash
claude
```

```text
/mcp
```

`github` should be connected.

## 2. Playwright connector

Node.js is already installed. Still outside the session:

```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

Quit the session (`/exit`) and start it again. `/mcp` should list `playwright` with browser tools (open, click, screenshot).

The cart has no UI, so do not point Playwright at the cart. Smoke-check the connector with a public page:

```text
Using Playwright MCP tools, open https://example.com, take a screenshot, and tell me the page title.
```

## 3. Exercise: one GitHub tool, end to end

Stay in that session. `/mcp` must show `github` connected.

```text
Use the GitHub MCP tools only. Do not use the shell.
List open pull requests in uyenho-agilityio/ai-training.
If one exists, add this comment on it: Day 8 MCP check.
Then tell me the PR number, the tool names you called, and the comment URL.
```

or

```text
Use the GitHub MCP tools only. On uyenho-agilityio/ai-training pull request 1, summarize the changed files and the existing comments. Do not post or merge anything.
```

or

```text
Use the GitHub MCP tools only. Do not use the shell.
Read README.md from uyenho-agilityio/ai-training on the default branch and summarize it in three lines.
```

or

````text
Use the GitHub MCP tools only. Do not use the shell.
List GitHub Actions workflows and the latest workflow runs for uyenho-agilityio/ai-training. If there are none, say so. Do not start or rerun anything.
```

Allow the tool calls when Claude asks.

If the list is empty, the branch `feat/mcp` is not on GitHub yet. Commit the two README files on that branch, push it, and open the pull request:

```bash
git push -u github feat/mcp
````

On GitHub, open a pull request from `feat/mcp` into the default branch. Return to the session and paste the prompt again.

Done when the reply names the pull request number, the MCP tools it called, and the comment URL.

## Remove

```bash
claude mcp remove github
claude mcp remove playwright
```
