# CopilotKit Practice — AI Travel Planner

A practice that simulates autonomous travel research and logistics orchestration through a single conversational viewport. The app synthesizes user preferences into structured itineraries, flight/hotel cards, step-by-step route recommendations (no map), and text-based local tips.

## Overview

| App / package                                          | Role                                                                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `apps/agent`                                           | Mastra agents, tools, CopilotKit runtime (`/chat`), [Mastra Studio](https://mastra.ai/docs/studio/overview) |
| `apps/web`                                             | Next.js + CopilotKit UI (chat, Generative UI, tabs)                                                         |
| `packages/ui`                                          | Shared React components (design system)                                                                     |
| `packages/eslint-config`, `packages/typescript-config` | Shared lint and TypeScript config                                                                           |

**Flow:** User chats in `web` → CopilotKit + AG-UI stream → `agent` (Mastra) → LLM + tools → UI updates across **Places**, **Itinerary**, and **Book** tabs.

## Learning objectives

- Build an AI-powered app with **CopilotKit** and a **Mastra** agent
- Use **AG-UI streaming events** between frontend and backend
- Implement a conversational chat UI with **real-time streaming**
- Add **human-in-the-loop (HITL)** confirmation before costly API calls
- Persist and restore conversations with **Mastra Memory** and storage
- Render **Generative UI** from agent execution state
- Integrate **external tools** (Open-Meteo, SerpAPI, etc.) into an AI workflow

## Tech stack

| Layer               | Technology                                                                                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime             | [Node.js](https://nodejs.org/) 24.3.0                                                                                                                                                                     |
| Monorepo            | [Turborepo](https://turborepo.dev/docs)                                                                                                                                                                   |
| Language            | [TypeScript](https://www.typescriptlang.org/docs/)                                                                                                                                                        |
| Agent               | [Mastra](https://mastra.ai/docs)                                                                                                                                                                          |
| Copilot UI          | [CopilotKit](https://docs.copilotkit.ai/)                                                                                                                                                                 |
| Agent ↔ UI protocol | [AG-UI](https://docs.ag-ui.com/)                                                                                                                                                                          |
| Web app             | [Next.js](https://nextjs.org/docs)                                                                                                                                                                        |
| Styling             | [Tailwind CSS](https://tailwindcss.com/docs)                                                                                                                                                              |
| LLM                 | [gpt-4o-mini](https://openrouter.ai/openai/gpt-4o-mini) via [OpenRouter](https://openrouter.ai/docs)                                                                                                      |
| Memory / threads    | [Postgres](https://www.postgresql.org/) ([Neon](https://neon.com/guides/mastra-neon)) + [`@mastra/pg`](https://mastra.ai/reference/storage/postgresql), or local [LibSQL](https://docs.turso.tech/libsql) |
| Deploy & traces     | [Mastra Platform](https://mastra.ai/docs/mastra-platform/overview)                                                                                                                                        |

## Developer tools

Versions from root `package.json` (`packageManager` / `devDependencies`).

| Tool                                                      | Version |
| --------------------------------------------------------- | ------- |
| [pnpm](https://pnpm.io/)                                  | 10.33.2 |
| [Turborepo](https://turborepo.dev/docs)                   | 2.9.16  |
| [TypeScript](https://www.typescriptlang.org/docs/)        | 6.0.3   |
| [ESLint](https://eslint.org/docs/latest/)                 | 9.39.4  |
| [Prettier](https://prettier.io/docs/en/)                  | 3.8.3   |
| [Husky](https://typicode.github.io/husky/)                | 9.1.7   |
| [lint-staged](https://github.com/lint-staged/lint-staged) | 17.0.7  |
| [commitlint](https://commitlint.js.org/)                  | 21.0.2  |

## Features

- Ask in chat for **today’s weather** at a destination and see it in the UI
- Get **destination ideas** as browseable place cards
- See a **day-by-day route** (text steps only, no map) in the itinerary
- Read **local tips** (warnings and cultural notes) alongside the plan
- **Search flights and hotels**, pick options from cards, and book from the Book tab
- Plan a **full trip in one flow**—places, flights, hotels, summary, daily schedule, and a morning / afternoon / evening timeline—after confirming searches in chat when prompted

## Prerequisites

- **Node.js** ≥ 22 (24.16.0 recommended)
- **pnpm** 10.33.2
- API keys listed below

## Environment variables

Copy the template and edit locally (do not commit `.env`):

```bash
cp apps/agent/.env.example apps/agent/.env
```

### Core

| Variable             | Purpose                                    | Where to get it                                                                |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| `OPENROUTER_API_KEY` | LLM chat and eval judge                    | [openrouter.ai/keys](https://openrouter.ai/keys)                               |
| `DATABASE_URL`       | Threads and message memory (Neon Postgres) | [Neon](https://neon.com) or any Postgres — omit for local LibSQL file fallback |

Recommended model setup:

```env
OPENROUTER_API_KEY=sk-or-v1-...
LLM_MODEL=openrouter/openai/gpt-4o-mini
JUDGE_MODEL=openrouter/google/gemini-2.5-flash-lite
```

Use `openrouter/openai/gpt-4o-mini`, not `openai/gpt-4o-mini`, when you only configure `OPENROUTER_API_KEY`.

### Mastra Platform observability (optional)

| Variable                       | Purpose                                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `MASTRA_PLATFORM_ACCESS_TOKEN` | Export traces/logs — CLI `mastra auth tokens create exporter-token` or **Observability** on [projects.mastra.ai](https://projects.mastra.ai) |
| `MASTRA_PROJECT_ID`            | Project UUID from `.mastra-project.json` or the dashboard                                                                                    |

### SerpAPI (flights / hotels)

| Variable          | Purpose                           |
| ----------------- | --------------------------------- |
| `SERPAPI_API_KEY` | `search-flights`, `search-hotels` |

## Getting started

### Clone and install

```bash
git clone git@gitlab.asoft-python.com:uyen.ho/ai-training.git
cd ai-training/ai-travel-planner-practice
pnpm install
```

### Development

Run both apps (recommended — two terminals):

```bash
pnpm dev:agent   # Mastra Studio + /chat → http://localhost:4111
pnpm dev:web     # Next.js UI → http://localhost:3000
```

Or run everything via Turborepo:

```bash
pnpm dev
```

The web app points at `http://localhost:4111/chat` and the registered agent name (e.g. `weatherAgent` until you switch to the travel planner agent).

### Build

```bash
pnpm build          # all apps
pnpm build:agent    # Mastra production bundle
pnpm build:web      # Next.js production
```

If `build:agent` fails bundling CopilotKit, add these **externals** in `apps/agent/src/mastra/index.ts`:

```ts
bundler: {
  externals: [
    "@ag-ui/mastra",
    "@ag-ui/mastra/copilotkit",
    "@copilotkit",
    "@copilotkit/runtime",
  ],
},
```

### Lint and format

```bash
pnpm lint
pnpm format
pnpm check-types
```

## How it works

Two apps run locally. The **web** app is what you see; the **agent** app is the brain and API.

| Port   | App          | What it does                                             |
| ------ | ------------ | -------------------------------------------------------- |
| `3000` | `apps/web`   | Chat UI, tabs (Places / Itinerary / Book), cards         |
| `4111` | `apps/agent` | Mastra agent, tools, CopilotKit endpoint `/chat`, Studio |

**When you send a chat message:**

1. **Web** sends the message to `http://localhost:4111/chat` (CopilotKit + AG-UI)
2. **Agent** runs the Mastra travel agent: reads chat history from the database, calls the LLM on OpenRouter
3. If needed, the agent calls **tools** (weather, flights, hotels) and may ask you to **confirm** first (HITL)
4. Replies and tool results **stream back** to the web app; the UI updates cards and tabs
5. Optional: traces go to [Mastra Platform](https://projects.mastra.ai) if observability env vars are set

```text
Browser (web :3000)
    │  chat + UI updates
    ▼
Mastra agent (:4111 /chat)
    ├── OpenRouter (LLM)
    ├── Tools → Open-Meteo, SerpAPI
    └── Database → chat threads & memory
```
