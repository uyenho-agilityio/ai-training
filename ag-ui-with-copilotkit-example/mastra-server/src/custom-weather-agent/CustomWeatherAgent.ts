import {
  AbstractAgent,
  EventType,
  type BaseEvent,
  type RunAgentInput,
  type Tool,
} from "@ag-ui/client";
import OpenAI from "openai";
import { Observable } from "rxjs";

import {
  CLIENT_TOOL_APPROVE_WEATHER,
  CUSTOM_WEATHER_AGENT_ID,
  MAX_AGENT_TURNS,
  OPENAI_MODEL,
  SERVER_TOOL_IDS,
  WEATHER_TOOL_ID,
} from "./constants";
import type { CustomWeatherAgentConfig, WeatherAgentState } from "./types";
import { buildWeatherAgentInstructions } from "../mastra/utils";
import { logAgUiTransport } from "./utils/log-transport";
import {
  createTextStreamEmitter,
  createToolCallStreamEmitter,
  withAgUiEvent,
} from "./utils/emit-events";
import { serverWeatherToolDefinition } from "./utils/server-weather-tool";
import { getOpenAiMessages } from "./utils/to-openai-messages";
import { getWeather } from "../mastra/tools/weather-tool";

const defaultWeatherState = (): WeatherAgentState => ({
  status: "idle",
  location: null,
  processingStage: "idle",
  weatherReport: null,
});

const mergeTools = (tools: Tool[]): Tool[] => {
  const byName = new Map<string, Tool>();

  for (const tool of tools) {
    byName.set(tool.name, tool);
  }

  if (!byName.has(WEATHER_TOOL_ID)) {
    byName.set(WEATHER_TOOL_ID, serverWeatherToolDefinition);
  }

  return [...byName.values()];
};

const toOpenAiTools = (
  tools: Tool[]
): OpenAI.Chat.Completions.ChatCompletionTool[] =>
  tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters as OpenAI.FunctionParameters,
    },
  }));

/**
 * AG-UI middleware agent: emit events through observer.next (not using MastraAgent)
 * @ag-ui/core — EventType, BaseEvent
 * @ag-ui/client — AbstractAgent, RunAgentInput
 * @ag-ui/encoder + @ag-ui/proto — log transport
 */
export class CustomWeatherAgent extends AbstractAgent {
  private readonly openai: OpenAI;
  private readonly currentCity?: string;
  private readonly debugTransport: boolean;

  constructor(config: CustomWeatherAgentConfig = {}) {
    super({
      agentId: CUSTOM_WEATHER_AGENT_ID,
      description: "Custom weather agent (AG-UI middleware)",
    });

    this.openai = new OpenAI({
      apiKey: config.openaiApiKey ?? process.env.OPENAI_API_KEY,
    });
    this.currentCity = config.currentCity;
    this.debugTransport =
      config.debugTransport ?? process.env.AG_UI_DEBUG_EVENTS === "true";
  }

  clone = (): CustomWeatherAgent =>
    new CustomWeatherAgent({
      currentCity: this.currentCity,
      debugTransport: this.debugTransport,
    });

  run = (input: RunAgentInput): Observable<BaseEvent> =>
    new Observable((observer) => {
      // Normalize timestamp + forward to CopilotKit subscriber
      const emit = (event: BaseEvent) => {
        const normalized = withAgUiEvent(event);
        if (this.debugTransport) {
          logAgUiTransport("custom-weather", normalized);
        }
        observer.next(normalized);
      };

      const runAgent = async () => {
        try {
          // 1. Lifecycle: run begins
          emit(
            withAgUiEvent({
              type: EventType.RUN_STARTED,
              threadId: input.threadId,
              runId: input.runId,
            })
          );

          // Merge co-agent state from client (useCoAgent initialState / prior snapshots)
          let agentState: WeatherAgentState = {
            ...defaultWeatherState(),
            ...(input.state as WeatherAgentState),
          };

          // Full state replace — proto-safe (unlike STATE_DELTA)
          const emitStateSnapshot = () => {
            emit(
              withAgUiEvent({
                type: EventType.STATE_SNAPSHOT,
                snapshot: agentState,
              })
            );
          };

          const tools = mergeTools(input.tools ?? []);
          const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
            [
              {
                role: "system",
                content: buildWeatherAgentInstructions({
                  currentCity: this.currentCity,
                  weatherToolName: WEATHER_TOOL_ID,
                }),
              },
              ...getOpenAiMessages(input.messages),
            ];

          // Agent loop: OpenAI → tools → (optional) next OpenAI turn
          for (let turn = 0; turn < MAX_AGENT_TURNS; turn += 1) {
            const messageId = crypto.randomUUID();
            // Proto-safe text stream: START → CONTENT* → END (not TEXT_MESSAGE_CHUNK)
            const textStream = createTextStreamEmitter(emit, messageId);
            // Proto-safe tool stream: START → ARGS* → END (not TOOL_CALL_CHUNK)
            const toolCallStream = createToolCallStreamEmitter(emit, messageId);
            const pendingToolCalls = new Map<
              number,
              { id: string; name: string; arguments: string }
            >();

            const stream = await this.openai.chat.completions.create({
              model: OPENAI_MODEL,
              stream: true,
              messages,
              tools: toOpenAiTools(tools),
            });

            // 2. Stream model output as AG-UI events
            for await (const chunk of stream) {
              const choice = chunk.choices[0];
              const delta = choice?.delta;

              if (delta?.content) {
                textStream.writeDelta(delta.content);
              }

              if (delta?.tool_calls) {
                for (const toolCallDelta of delta.tool_calls) {
                  const index = toolCallDelta.index ?? 0;
                  const current = pendingToolCalls.get(index) ?? {
                    id: "",
                    name: "",
                    arguments: "",
                  };

                  if (toolCallDelta.id) current.id = toolCallDelta.id;
                  if (toolCallDelta.function?.name) {
                    current.name = toolCallDelta.function.name;
                  }
                  if (toolCallDelta.function?.arguments) {
                    current.arguments += toolCallDelta.function.arguments;
                  }

                  pendingToolCalls.set(index, current);

                  if (current.id && current.name) {
                    toolCallStream.writeDelta(
                      index,
                      current.id,
                      current.name,
                      toolCallDelta.function?.arguments
                    );
                  }
                }
              }
            }

            textStream.end();

            const toolCalls = [...pendingToolCalls.values()].filter(
              (toolCall) => toolCall.id && toolCall.name
            );

            for (const toolCall of toolCalls) {
              toolCallStream.end(toolCall.id);
            }

            // No tools → assistant reply complete, exit loop
            if (!toolCalls.length) {
              break;
            }

            messages.push({
              role: "assistant",
              content: "",
              tool_calls: toolCalls.map((toolCall) => ({
                id: toolCall.id,
                type: "function" as const,
                function: {
                  name: toolCall.name,
                  arguments: toolCall.arguments,
                },
              })),
            });

            const clientToolCalls = toolCalls.filter(
              (toolCall) => !SERVER_TOOL_IDS.has(toolCall.name)
            );
            const serverToolCalls = toolCalls.filter((toolCall) =>
              SERVER_TOOL_IDS.has(toolCall.name)
            );

            // 3. Server tool (get-weather): STATE_SNAPSHOT before/after API
            for (const toolCall of serverToolCalls) {
              const args = JSON.parse(toolCall.arguments || "{}") as {
                location?: string;
              };
              const location = args.location?.trim() ?? "";

              agentState = {
                ...agentState,
                status: "fetching",
                location: location || agentState.location,
                processingStage: "fetching",
              };
              emitStateSnapshot(); // → WeatherInfo inProgress + location pin

              try {
                const report = await getWeather(location);
                agentState = {
                  ...agentState,
                  status: "done",
                  location: report.location,
                  processingStage: "done",
                  weatherReport: report,
                };
                emitStateSnapshot(); // → weather card (status done)

                messages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(report),
                });
              } catch (error) {
                agentState = {
                  ...agentState,
                  status: "error",
                  processingStage: "error",
                };
                emitStateSnapshot();

                messages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({
                    error:
                      error instanceof Error ? error.message : String(error),
                  }),
                });
              }
            }

            // Client HITL (approveWeatherFetch): tool events already sent — wait for user
            if (
              clientToolCalls.some(
                (toolCall) => toolCall.name === CLIENT_TOOL_APPROVE_WEATHER
              )
            ) {
              break;
            }

            if (!serverToolCalls.length) {
              break;
            }

            // Server tool result in messages → next turn for natural-language reply
          }

          // 4. Lifecycle: run complete
          emit(
            withAgUiEvent({
              type: EventType.RUN_FINISHED,
              threadId: input.threadId,
              runId: input.runId,
            })
          );

          observer.complete();
        } catch (error) {
          emit(
            withAgUiEvent({
              type: EventType.RUN_ERROR,
              message: error instanceof Error ? error.message : String(error),
            })
          );
          observer.error(error);
        }
      };

      // Return Observable immediately; stream events as OpenAI resolves
      void runAgent();
    });
}
