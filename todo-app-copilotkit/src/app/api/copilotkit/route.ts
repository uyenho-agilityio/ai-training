import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";

import { OPENAI_API_KEY_HEADER } from "@/constants";

const runtime = new CopilotRuntime({
  agents: ({ request }) => {
    const apiKey =
      request.headers.get(OPENAI_API_KEY_HEADER)?.trim() || undefined;

    return {
      default: new BuiltInAgent({
        model: "openai:gpt-5.4-mini",
        ...(apiKey && { apiKey }),
      }),
    };
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
