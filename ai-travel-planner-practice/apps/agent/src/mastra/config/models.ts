import { DEV_CHAT_MODEL_DEFAULT, PROD_CHAT_MODEL } from "./constants";
import type { LlmModelId } from "./types";

/** True when NODE_ENV is production (deployed runtime). */
const isProduction = (): boolean => process.env.NODE_ENV === "production";

/**
 * Resolves the chat model from env.
 * Dev: OpenRouter (free/cheap). Prod: OpenAI unless LLM_MODEL is set.
 */
const resolveChatModel = (): LlmModelId => {
  if (isProduction()) {
    return process.env.LLM_MODEL ?? PROD_CHAT_MODEL;
  }

  return (
    process.env.DEV_LLM_MODEL ?? process.env.LLM_MODEL ?? DEV_CHAT_MODEL_DEFAULT
  );
};

/**
 * Resolves the judge model for eval scorers (can differ from chat model).
 */
const resolveJudgeModel = (): LlmModelId => {
  if (isProduction()) {
    return process.env.JUDGE_MODEL ?? process.env.LLM_MODEL ?? PROD_CHAT_MODEL;
  }

  return (
    process.env.DEV_JUDGE_MODEL ??
    process.env.DEV_LLM_MODEL ??
    DEV_CHAT_MODEL_DEFAULT
  );
};

export const chatModel: LlmModelId = resolveChatModel();
export const judgeModel: LlmModelId = resolveJudgeModel();
