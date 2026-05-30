import { registerApiRoute, type ContextWithMastra } from "@mastra/core/server";
import { RequestContext } from "@mastra/core/request-context";
import {
  CopilotRuntime,
  copilotRuntimeNodeHttpEndpoint,
  ExperimentalEmptyAdapter,
} from "@copilotkit/runtime";

import {
  CustomWeatherAgent,
  CUSTOM_WEATHER_AGENT_ID,
} from "../custom-weather-agent";
import { REQUEST_CONTEXT_CURRENT_CITY } from "./constants";

type RegisterCustomCopilotKitOptions = {
  path: string;
  setContext?: (
    c: ContextWithMastra,
    requestContext: RequestContext
  ) => void | Promise<void>;
};

export const registerCustomCopilotKit = ({
  path,
  setContext,
}: RegisterCustomCopilotKitOptions) =>
  registerApiRoute(path, {
    method: "ALL",
    handler: async (c) => {
      const requestContext = new RequestContext();

      if (setContext) {
        await setContext(c, requestContext);
      }

      const currentCity = requestContext.get(
        REQUEST_CONTEXT_CURRENT_CITY
      ) as string;

      const httpHandler = copilotRuntimeNodeHttpEndpoint({
        endpoint: path,
        runtime: new CopilotRuntime({
          agents: {
            [CUSTOM_WEATHER_AGENT_ID]: new CustomWeatherAgent({ currentCity }),
          },
        }),
        serviceAdapter: new ExperimentalEmptyAdapter(),
      });

      return httpHandler(c.req.raw);
    },
  });
