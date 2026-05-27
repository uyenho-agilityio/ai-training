import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";
import { PinoLogger } from "@mastra/loggers";
import { MastraCompositeStore } from "@mastra/core/storage";
import {
  Observability,
  MastraStorageExporter,
  MastraPlatformExporter,
  SensitiveDataFilter,
} from "@mastra/observability";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { weatherAgent } from "./agents/weather-agent";
import {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
} from "./scorers/weather-scorer";
import { getDBStore } from "../mastra/utils";

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent },
  scorers: {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer,
  },
  storage: new MastraCompositeStore({
    id: "composite-storage",
    default: getDBStore("mastra-storage"),
  }),
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
      origin: corsOrigins,
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    apiRoutes: [
      registerCopilotKit({
        path: "/chat",
        resourceId: "weatherAgent",
      }),
    ],
  },
  bundler: {
    externals: [
      "@copilotkit",
      "@copilotkit/runtime",
      "@ag-ui/mastra",
      "@mastra/libsql",
      "@libsql",
    ],
  },
});
