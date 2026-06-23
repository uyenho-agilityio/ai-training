import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import {
  Observability,
  MastraStorageExporter,
  MastraPlatformExporter,
  SensitiveDataFilter,
} from "@mastra/observability";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";

import { weatherWorkflow } from "./workflows";
import { travelAgent } from "./agents";
import {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
} from "./scorers";
import { createStorage } from "./configs";

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { travelAgent },
  scorers: {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer,
  },
  storage: createStorage(),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "mastra",
        exporters: [
          new MastraStorageExporter(), // Persists observability events to Mastra Storage
          new MastraPlatformExporter(), // Sends observability events to Mastra Platform (if MASTRA_PLATFORM_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
  server: {
    cors: {
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    apiRoutes: [
      registerCopilotKit({
        path: "/chat",
        resourceId: "travelAgent",
      }),
    ],
  },
  bundler: {
    externals: [
      "@ag-ui/mastra",
      "@ag-ui/mastra/copilotkit",
      "@copilotkit",
      "@copilotkit/runtime",
    ],
  },
});
