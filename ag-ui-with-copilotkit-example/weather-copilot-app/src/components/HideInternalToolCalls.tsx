"use client";

import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

const HIDDEN_TOOL_NAMES = [
  "weatherTool",
  "get-weather",
  "updateWorkingMemory",
] as const;

const hideToolRender = () => <></>;

const weatherParams = z.object({
  location: z.string().optional(),
});

const memoryParams = z.record(z.string(), z.unknown());

export const HideInternalToolCalls = () => {
  useRenderTool({
    name: HIDDEN_TOOL_NAMES[0],
    parameters: weatherParams,
    render: hideToolRender,
  });
  useRenderTool({
    name: HIDDEN_TOOL_NAMES[1],
    parameters: weatherParams,
    render: hideToolRender,
  });
  useRenderTool({
    name: HIDDEN_TOOL_NAMES[2],
    parameters: memoryParams,
    render: hideToolRender,
  });

  return null;
};
